// Mão em traço fino, de lado (vem da direita, em diagonal), indicador apertando o botão.
// Desenho original em SVG inspirado na pose da referência. Coordenadas num espaço 1260×1260;
// a ponta do dedo (ponto de contato) fica em TIP.

export const TIP = { x: 530, y: 446 };

// Contorno (aberto) da mão; a versão fechada serve de preenchimento escuro que cobre o botão
const OUTLINE = [
  "M935 1235",
  "C925 1190 870 1140 800 1110", // borda inferior da mão
  "C720 1080 660 1040 635 1005",
  "C600 950 560 890 545 850",
  "C535 812 515 782 515 752", // polegar: lado de baixo
  "C513 726 540 714 562 726", // ponta do polegar
  "C590 740 612 772 626 815", // polegar: lado de cima
  "L648 790", // encontro com o indicador
  "C602 706 548 566 510 474", // indicador: lado de baixo
  "C496 440 520 414 550 422", // ponta do indicador
  "C574 430 588 452 600 478", // indicador: lado de cima
  "C632 532 668 582 700 604",
  "C716 586 744 566 770 572", // nó do médio
  "C800 580 820 600 838 622",
  "C852 606 880 602 902 616", // nó do anelar
  "C922 628 934 640 944 652",
  "C968 650 1000 670 1030 700", // nó do mindinho
  "C1052 724 1062 752 1070 790", // lateral da mão
  "C1084 860 1104 950 1146 1022",
  "L1176 1022 L1256 1092", // punho
].join(" ");
const FILL = OUTLINE + " L1256 1300 L935 1300 Z";

// Linhas internas (só traço)
const DETAILS = [
  "M700 604 C730 642 760 680 786 702", // contorno do médio sobre a palma
  "M838 622 C858 652 878 680 896 700", // anelar
  "M944 652 C962 676 980 700 992 716", // mindinho
  "M876 702 C892 726 906 752 916 778", // vinco
  "M792 760 C808 786 822 810 834 830", // vinco
  "M576 516 Q596 510 612 520", // dobras do indicador
  "M584 532 Q602 527 618 536",
  "M507 452 C512 432 544 426 558 446 C548 460 520 464 507 452", // unha do indicador
  "M522 748 C524 732 546 730 554 742", // unha do polegar
  "M616 698 C612 738 620 786 646 798 C662 804 670 790 666 770", // ponta do médio, sob o indicador
  "M546 806 Q560 800 572 812", // vinco do polegar
  "M630 822 C652 862 690 902 712 952", // base do polegar
  "M1146 1022 C1100 1060 1000 1120 935 1235", // pulso
];

export const LineHand: React.FC<{ light: number; draw: number }> = ({ light, draw }) => {
  const stroke = `rgba(${222 + 30 * light},${214 + 20 * light},255,${0.78 + 0.22 * light})`;
  return (
    <g>
      <defs>
        <linearGradient id="lhFill" x1="500" y1="420" x2="1100" y2="1200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={`rgb(${34 + 30 * light},${26 + 14 * light},${58 + 50 * light})`} />
          <stop offset="0.5" stopColor="#120E22" />
          <stop offset="1" stopColor="#07060C" />
        </linearGradient>
        <linearGradient id="lhFade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.62" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.95" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="lhMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1300" height="1300">
          <rect x="0" y="0" width="1300" height="1300" fill="url(#lhFade)" />
        </mask>
        <filter id="lhGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={1.5 + 4 * light} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g mask="url(#lhMask)">
        <path d={FILL} fill="url(#lhFill)" opacity={0.94} />
        <g fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" filter="url(#lhGlow)">
          <path d={OUTLINE} strokeWidth={4.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          {DETAILS.map((d, k) => (
            <path
              key={k}
              d={d}
              strokeWidth={3.2}
              strokeOpacity={0.8}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - Math.min(1, Math.max(0, (draw - 0.4 - k * 0.015) / 0.4))}
            />
          ))}
        </g>
      </g>
    </g>
  );
};
