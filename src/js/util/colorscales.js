
const tealScale = {
    6: ['#e3fffc', '#afe7e3', '#78cfcb', '#34b7b3', '#289a94', '#1c7e77'],
    5: ['#e3fffc', '#a3e1dd', '#59c2bf', '#2ba09c', '#1c7e77'],
    4: ['#e3fffc', '#8bd7d3', '#30ada9', '#1c7e77'],
    3: ['#e3fffc', '#59c2bf', '#1c7e77'],
    2: ['#e3fffc', '#1c7e77'],
    1: ['#35b8b5']
};

const orangeScale = {
  6: ["#feedde","#fdd0a2","#fdae6b","#fd8d3c","#e6550d","#a63603"],
  5: ["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
  4: ["#feedde","#fdbe85","#fd8d3c","#d94701"],
  3: ["#fee6ce","#fdae6b","#e6550d"],
  2: ['#fee6ce', '#e6550d'],
  1: ['#e8983a']
};

const partisanScaleD = {
    6: ['#ceeafd', '#a9d0ed', '#84b6de', '#5f9cce', '#3b83bd', '#006aab'],
    5: ['#ceeafd', '#a0caea', '#71a9d6', '#4489c1', '#006aab'],
    4: ['#ceeafd', '#90bee3', '#5395c8', '#006aab'],
    3: ['#ceeafd', '#71a9d6', '#006aab'],
    2: ['#ceeafd', '#006aab'],
    1: ['#3f8ac1']
};
const partisanScaleR = {
  6: ['#fbd0d0', '#f5ada9', '#eb8a83', '#dc6761', '#c84643', '#b02029'],
  5: ['#fbd0d0', '#f3a5a0', '#e57971', '#ce4e4b', '#b02029'],
  4: ['#fbd0d0', '#ef968f', '#d65d57', '#b02029'],
  3: ['#fbd0d0', '#e57971', '#b02029'],
  2: ['#fbd0d0', '#b02029'],
  1: ['#cf4c49']
};

const pinkScale = {
    1: ['#D5629B'],
    2: ['#fde0dd', '#c51b8a'],
    3: ["#fde0dd","#fa9fb5","#c51b8a"],
    4: ["#feebe2","#fbb4b9","#f768a1","#ae017e"],
    5: ["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
    6: ["#feebe2","#fcc5c0","#fa9fb5","#f768a1","#c51b8a","#7a0177"]
};

const seaGreen = {
	1: ['#a1dab4'],
	2: ['#edf8b1', '#2c7fb8'],
	3: ["#edf8b1","#7fcdbb","#2c7fb8"],
	4: ["#ffffcc","#a1dab4","#41b6c4","#225ea8"],
	5: ["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
	6: ["#ffffcc","#c7e9b4","#7fcdbb","#41b6c4","#2c7fb8","#253494"]
}

const independentScale = {
  1: ['#31a354'],
  2: ['#e5f5e0', '#31a354'],
  3: ["#e5f5e0","#a1d99b","#31a354"],
  4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
  5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
  6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"]
};

const lightGreyScale = {
    1: ['#a9aaaa'],
    2: ['#f7f7f7', '#636363'],
    3: ['#f7f7f7', '#a9aaaa', '#636363'],
    4: ["#f7f7f7","#cccccc","#969696","#636363"],
    5: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363"],
    6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252"]
};

const darkGreyScale = {
    1: ['#aaaaa'],
    2: ['#aaaaaa', '#000000'],
    3: ['#aaaaaa', '#515252', '#000000'],
    4: ['#aaaaaa', '#6e6e6e', '#383838', '#000000'],
    5: ['#aaaaaa', '#7c7c7c', '#515252', '#2b2b2b', '#000000'],
    6: ['#aaaaaa', '#868686', '#626262', '#424242', '#232323', '#000000']
};

const colors = {
  0:tealScale,
  1:orangeScale,
  2:pinkScale,
  3:seaGreen,
  4:partisanScaleD,
  5:partisanScaleR,
  6:independentScale,
  7:lightGreyScale,
  8:darkGreyScale
}

function scalesMap(keyval) {
  return colors[keyval];
}

function scalesNum() {
  return Object.keys(colors).length;
}

const colorscales = Object.freeze({
  scalesMap:scalesMap,
  scalesNum:scalesNum
});


module.exports = colorscales;
