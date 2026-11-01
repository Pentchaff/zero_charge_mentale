// Rikki, l'écureuil compagnon, en SVG animé (ADR 0010). Un seul design pour
// tous les membres ; il grandit et gagne des accessoires (ADR 0020) mais ne
// montre jamais rien de négatif (ADR 0008).

import type { CSSProperties } from 'react';
import type { ActiviteRikki } from '../../compagnon/cycleDeVie';
import type { AccessoireRikki } from '../../domaine/progression';

export type EtatRikki = ActiviteRikki | 'joie' | 'calin';

interface Props {
  etat: EtatRikki;
  taille?: number;
  accessoires?: ReadonlySet<AccessoireRikki>;
  className?: string;
  style?: CSSProperties;
  titre?: string;
}

const POIL = '#d9874a';
const POIL_FONCE = '#b86a33';
const CREME = '#f8e6cb';
const OEIL = '#2b1d14';

function Gland({ x, y, dore = false }: { x: number; y: number; dore?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={8} ry={10} fill={dore ? '#f2c94c' : '#c98b4a'} stroke={dore ? '#c9962a' : '#9a6232'} strokeWidth={1.5} />
      <path d="M-10,-2 Q0,-12 10,-2 Q0,2 -10,-2 Z" fill={dore ? '#d9a832' : '#7a4b2a'} />
      <path d="M0,-8 L1,-13" stroke="#7a4b2a" strokeWidth={2} strokeLinecap="round" />
      {dore && <circle cx={-3} cy={2} r={2} fill="#fff6d0" />}
    </g>
  );
}

export function Rikki({ etat, taille = 1, accessoires = new Set(), className, style, titre }: Props) {
  const yeuxFermes = etat === 'dort' || etat === 'calin' || etat === 'joie';
  const regard = etat === 'fenetre' ? -6 : 0;
  return (
    <svg
      viewBox="0 0 200 200"
      className={['rikki', `rikki--${etat}`, className].filter(Boolean).join(' ')}
      style={{ ...style, transform: `scale(${taille})`, transformOrigin: '50% 100%' }}
      role="img"
      aria-label={titre}
    >
      {titre && <title>{titre}</title>}
      <g className="rikki-saut">
        {accessoires.has('cape') && (
          <path d="M62,118 C50,150 52,178 60,186 L130,186 C138,178 140,150 128,118 Z" fill="#a98bd6" stroke="#8668b8" strokeWidth={2} />
        )}

        {/* Queue : grande, touffue, qui balance doucement. */}
        <g className="rikki-queue">
          <path
            d="M116,170 C172,174 196,124 178,82 C166,52 132,36 118,60 C108,78 136,86 144,102 C152,122 132,142 110,148 Z"
            fill={POIL}
            stroke={POIL_FONCE}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <path d="M128,150 C160,146 176,116 166,88 C160,72 146,64 136,70" fill="none" stroke={CREME} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        </g>

        <g className="rikki-corps">
          <ellipse cx={95} cy={142} rx={42} ry={44} fill={POIL} stroke={POIL_FONCE} strokeWidth={2.5} />
          <ellipse cx={95} cy={150} rx={26} ry={30} fill={CREME} />
          <ellipse cx={77} cy={184} rx={13} ry={7} fill={POIL_FONCE} />
          <ellipse cx={113} cy={184} rx={13} ry={7} fill={POIL_FONCE} />
        </g>

        {accessoires.has('echarpe') && (
          <g>
            <path d="M62,116 Q95,132 128,116 L128,126 Q95,142 62,126 Z" fill="#6fb3a8" stroke="#4f8f86" strokeWidth={2} />
            <path d="M112,126 L118,152 L106,150 Z" fill="#6fb3a8" stroke="#4f8f86" strokeWidth={2} strokeLinejoin="round" />
          </g>
        )}

        {/* Pattes avant, qui tiennent un gland, un cœur ou rien. */}
        <g className="rikki-pattes">
          {etat === 'grignote' && <Gland x={95} y={122} dore={accessoires.has('glandDore')} />}
          {etat === 'calin' && (
            <path d="M95,138 C80,126 82,112 95,120 C108,112 110,126 95,138 Z" fill="#f4978e" stroke="#d97a72" strokeWidth={2} />
          )}
          <ellipse cx={84} cy={128} rx={8} ry={6} fill={POIL} stroke={POIL_FONCE} strokeWidth={2} />
          <ellipse cx={106} cy={128} rx={8} ry={6} fill={POIL} stroke={POIL_FONCE} strokeWidth={2} />
        </g>

        {/* Inclinaison en attribut SVG : l'animation CSS de .rikki-tete ne l'écrase pas. */}
        <g transform={etat === 'dort' ? 'rotate(-8 95 110)' : undefined}>
        <g className="rikki-tete">
          {/* Oreilles avec leurs petits plumets. */}
          <path d="M62,62 L60,24 L86,48 Z" fill={POIL} stroke={POIL_FONCE} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M128,62 L130,24 L104,48 Z" fill={POIL} stroke={POIL_FONCE} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M60,26 L56,14 M60,26 L64,13" stroke={POIL_FONCE} strokeWidth={3} strokeLinecap="round" />
          <path d="M130,26 L126,13 M130,26 L134,14" stroke={POIL_FONCE} strokeWidth={3} strokeLinecap="round" />
          <path d="M66,54 L65,34 L80,48 Z" fill="#f4b8a0" />
          <path d="M124,54 L125,34 L110,48 Z" fill="#f4b8a0" />

          <circle cx={95} cy={80} r={40} fill={POIL} stroke={POIL_FONCE} strokeWidth={2.5} />
          <ellipse cx={95} cy={98} rx={24} ry={17} fill={CREME} />
          <ellipse cx={68} cy={94} rx={8} ry={5} fill="#f4978e" opacity={0.5} />
          <ellipse cx={122} cy={94} rx={8} ry={5} fill="#f4978e" opacity={0.5} />

          {yeuxFermes ? (
            <g fill="none" stroke={OEIL} strokeWidth={3.2} strokeLinecap="round">
              {etat === 'dort' ? (
                <>
                  <path d="M73,80 Q80,86 87,80" />
                  <path d="M103,80 Q110,86 117,80" />
                </>
              ) : (
                <>
                  <path d="M73,82 Q80,74 87,82" />
                  <path d="M103,82 Q110,74 117,82" />
                </>
              )}
            </g>
          ) : (
            <g transform={`translate(${regard} 0)`}>
            <g className="rikki-yeux">
              <ellipse cx={80} cy={79} rx={6} ry={8} fill={OEIL} />
              <ellipse cx={110} cy={79} rx={6} ry={8} fill={OEIL} />
              <circle cx={82.5} cy={75.5} r={2.4} fill="#fff" />
              <circle cx={112.5} cy={75.5} r={2.4} fill="#fff" />
            </g>
            </g>
          )}

          <ellipse cx={95} cy={92} rx={4.5} ry={3.2} fill="#6b3a26" />
          <path
            className="rikki-bouche"
            d="M88,98 Q91.5,102 95,98 Q98.5,102 102,98"
            fill="none"
            stroke="#6b3a26"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {accessoires.has('feuille') && (
            <g transform="translate(92 42) rotate(-20)">
              <path d="M0,0 C-18,-6 -22,-24 -4,-30 C14,-24 14,-6 0,0 Z" fill="#8fcf7a" stroke="#5f9e4f" strokeWidth={2} />
              <path d="M0,0 L-4,-26" stroke="#5f9e4f" strokeWidth={1.6} />
            </g>
          )}
        </g>
        </g>

        {accessoires.has('glandDore') && etat !== 'grignote' && <Gland x={40} y={176} dore />}
      </g>

      {etat === 'dort' && (
        <g className="rikki-zzz" fill="#8a7a9e" fontWeight={700} fontFamily="ui-rounded, sans-serif">
          <text x={140} y={40} fontSize={18}>z</text>
          <text x={154} y={24} fontSize={14}>z</text>
        </g>
      )}
      {etat === 'joie' && (
        <g className="rikki-coeurs" fill="#f4978e">
          <path d="M40,50 C34,44 36,38 40,42 C44,38 46,44 40,50 Z" transform="scale(1.6) translate(-14 -14)" />
          <path d="M160,40 C154,34 156,28 160,32 C164,28 166,34 160,40 Z" transform="scale(1.3) translate(-30 -6)" />
        </g>
      )}
    </svg>
  );
}
