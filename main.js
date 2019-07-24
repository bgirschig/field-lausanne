import * as slidewhow from "./Slideshow.js";
import * as swingDetector from "./SwingDetector.js";

const sources = [
  "images/MEL_ANONYME_043712.jpg",
  "images/MEL_BOISSONAS_Frederic_001583_LoRes.jpg",
  "images/MEL_BOUVIER_Nicolas_028385_LoRes.jpg",
  "images/MEL_CHESSEX_Luc_044815.jpg",
  "images/MEL_CRAWL_martin_045714.jpg",
  "images/MEL_DALLAPORTA043265.jpg",
  "images/MEL_DE BARROS_020032.jpg",
  "images/MEL_DEJONGH_gaston_048506_LoRes.jpg",
  "images/MEL_EYNARD_jean-gabriel_005938_LoRes.jpg",
  "images/MEL_FEHR_gertrude_002246_LoRes.jpg",
  "images/MEL_FREED_leonard_039483_LoRes.jpg",
  "images/MEL_GAFSOU_Matthieu_048758.jpg",
  "images/MEL_GIACOMELLI_Mario_003179.jpg",
  "images/MEL_GRINDAT_henriette_002425_LoRes.jpg",
  "images/MEL_HALSMAN_Philippe_044202.jpg",
  "images/MEL_JACOT_monique_043630_LoRes.jpg",
  "images/MEL_LEHNERT-LANDROCK_012065_LoRes.jpg",
  "images/MEL_LIPPMANN_Gabriel_009083.jpg",
  "images/MEL_LIU XIAOFANG_045967.jpg",
  "images/MEL_MAILLART_ella_033010_LoRes.jpg",
  "images/MEL_MOHOLY-NAGY_lucia_0011761_LoRes.jpg",
  "images/MEL_SCHLEMMER_rodolphe_005339_LoRes.jpg",
  "images/MEL_STEINER_hans_038878_LoRes.jpg",
  "images/MEL_TANGUY_044199.jpg",
  "images/MEL_TOSCANI_oliviero_043472_LoRes.jpg",
  "images/MEL_VIONNET_paul_048210_LoRes.jpg",
  "images/MEL_WEISS_sabine_010852_LoRes.jpg",
  "images/MEL_WOODS_Paolo_050855.jpg",
]

function main() {
  swingDetector.init(onValue);
  slidewhow.init(sources);
  document.addEventListener('click', slidewhow.next);
}

function onValue(e) {
  // console.log(e.value);
  if (e.apogee === 'back') {
    slidewhow.next({ autoPlay: true });
  }
  
  // console.log(e.absValue);
  // if (slidewhow.transitionValue < e.absValue) slidewhow.setTransitionValue(e.absValue);
}

main();