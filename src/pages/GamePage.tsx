import { Alert, Badge, Button, Heading, HStack, Stack } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useBackend } from '../api/backend-context';
import type { Color, Player } from '../api/types/shared';
import { useCurrentUser } from '../auth/current-user';
import { ChessBoard } from '../game/ChessBoard';
import { ConnectionBanner } from '../game/ConnectionBanner';
import { GameClock } from '../game/GameClock';
import { resign, sendMove } from '../game/game-actions';
import {
  colorOf,
  OUTCOME_TEXT,
  OUTCOME_TOKEN,
  outcomeFor,
  reasonText,
} from '../game/outcome';
import { PromotionDialog } from '../game/PromotionDialog';
import { ResignDialog } from '../game/ResignDialog';
import {
  checkedKing,
  legalTargets,
  moveKind,
  positionAfter,
  turnOf,
} from '../game/rules';
import { applyResultLeft, useGameStore } from '../game/store';
import { HeroBand } from '../layout/HeroBand';
import { PieceCard } from '../layout/PieceCard';

export function GamePage() {
  const { gameSocket } = useBackend();
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const connection = useGameStore((store) => store.connection);
  const status = useGameStore((store) => store.status);
  const game = useGameStore((store) => store.game);
  const pendingMove = useGameStore((store) => store.pendingMove);
  const end = useGameStore((store) => store.end);

  const [selected, setSelected] = useState<string>();
  const [promotion, setPromotion] = useState<{ from: string; to: string }>();
  const move = useMutation({
    mutationFn: (uci: string) => sendMove(gameSocket, uci),
  });
  const resignation = useMutation({ mutationFn: () => resign(gameSocket) });

  if (
    connection === 'connected' &&
    (status === 'idle' || status === 'queued')
  ) {
    return <Navigate to="/" replace />;
  }
  if (!game || !user) {
    return (
      <HeroBand board={null}>
        <ConnectionBanner />
      </HeroBand>
    );
  }

  const color = colorOf(game, user.id);
  const opponentColor: Color = color === 'white' ? 'black' : 'white';
  const opponent = game[opponentColor];
  const fen = positionAfter(game.fen, pendingMove);
  const ended = status === 'ended';
  const canMove =
    !ended &&
    connection === 'connected' &&
    !pendingMove &&
    turnOf(fen) === color;
  // A selection counts only while the user can move.
  const active = canMove ? selected : undefined;
  const targets = active ? legalTargets(fen, active) : [];

  function tryMove(from: string, to: string): boolean {
    setSelected(undefined);
    const kind = moveKind(fen, from, to);
    if (kind === 'promotion') {
      setPromotion({ from, to });
    } else if (kind === 'move') {
      move.mutate(from + to);
    }
    return kind === 'move';
  }

  const ownPiece = (pieceType: string) => pieceType[0] === color[0];

  return (
    <HeroBand
      asideWidth="24rem"
      board={
        <ChessBoard
          id="game-board"
          fen={fen}
          size="min(40rem, calc(100vh - 13rem))"
          orientation={color}
          lastMove={pendingMove ?? game.moves[game.moves.length - 1]}
          check={checkedKing(fen)}
          selected={active}
          targets={targets}
          canDragPiece={({ piece }) => canMove && ownPiece(piece.pieceType)}
          onPieceDrag={({ square }) => setSelected(square ?? undefined)}
          onPieceDrop={({ sourceSquare, targetSquare }) =>
            targetSquare ? tryMove(sourceSquare, targetSquare) : false
          }
          onSquareClick={({ piece, square }) => {
            if (!canMove) {
              return;
            }
            if (active && targets.some((target) => target.square === square)) {
              tryMove(active, square);
            } else if (piece && ownPiece(piece.pieceType)) {
              setSelected(active === square ? undefined : square);
            } else {
              setSelected(undefined);
            }
          }}
        />
      }
    >
      <Stack gap="6">
        <Stack gap="4">
          <Heading as="h1" size="3xl" letterSpacing="tight">
            Game against {opponent.name}
          </Heading>
          <HStack>
            <Badge
              size="lg"
              rounded="full"
              px="3"
              bg="hero.subtle"
              color="hero.fg"
              aria-live="polite"
            >
              {ended
                ? 'The game is over'
                : turnOf(fen) === color
                  ? 'Your move'
                  : `${thinker(opponent)} is thinking`}
            </Badge>
          </HStack>
        </Stack>

        <ConnectionBanner />
        {move.isError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>The move could not be made. Try again.</Alert.Title>
          </Alert.Root>
        )}
        {resignation.isError && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>
              The game could not be resigned. Try again.
            </Alert.Title>
          </Alert.Root>
        )}

        <PieceCard
          tone={opponentColor === 'white' ? 'light' : 'dark'}
          piece={`${opponentColor[0]}K`}
          title={opponent.name}
          text={`Plays ${opponentColor}`}
        >
          <GameClock color={opponentColor} />
        </PieceCard>
        <PieceCard
          tone={color === 'white' ? 'light' : 'dark'}
          piece={`${color[0]}K`}
          title={`${user.userName} (you)`}
          text={`Plays ${color}`}
        >
          <GameClock color={color} />
        </PieceCard>

        {ended && end ? (
          <Result
            color={color}
            result={end.result}
            reason={end.reason}
            onReplay={() =>
              navigate(`/history/${game.gameId}`, {
                state: { justEnded: true },
              })
            }
            onLeave={() => {
              useGameStore.setState(applyResultLeft);
              navigate('/');
            }}
          />
        ) : (
          <HStack>
            <ResignDialog
              disabled={connection !== 'connected'}
              loading={resignation.isPending}
              onResign={() => resignation.mutate()}
            />
          </HStack>
        )}
      </Stack>

      <PromotionDialog
        open={!!promotion && canMove}
        color={color}
        onChoose={(letter) => {
          if (promotion) {
            move.mutate(promotion.from + promotion.to + letter);
          }
          setPromotion(undefined);
        }}
        onCancel={() => setPromotion(undefined)}
      />
    </HeroBand>
  );
}

function Result({
  color,
  result,
  reason,
  onReplay,
  onLeave,
}: {
  color: Color;
  result: string;
  reason: string;
  onReplay: () => void;
  onLeave: () => void;
}) {
  const outcome = outcomeFor(result, color);
  return (
    <PieceCard
      tone={color === 'white' ? 'light' : 'dark'}
      piece={`${color[0]}K`}
      title={
        <HStack gap="3">
          <Badge
            size="lg"
            bg={`outcome.${OUTCOME_TOKEN[outcome]}.bg`}
            color={`outcome.${OUTCOME_TOKEN[outcome]}.fg`}
          >
            {OUTCOME_TEXT[outcome]}
          </Badge>
          {reasonText(reason)}
        </HStack>
      }
      text="The board shows the final position."
    >
      <HStack gap="2" wrap="wrap">
        <Button colorPalette="brand" rounded="full" onClick={onReplay}>
          Replay the game
        </Button>
        <Button variant="outline" rounded="full" onClick={onLeave}>
          Back to lobby
        </Button>
      </HStack>
    </PieceCard>
  );
}

function thinker(player: Player): string {
  return player.kind === 'bot' ? 'The computer' : player.name;
}
