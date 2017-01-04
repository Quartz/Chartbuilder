
  const tealScale = {
      6: ['#1c7e77', '#2a9992', '#41b5af', '#74cdc7', '#afe3de', '#e4faf5'].reverse(),
      5: ['#1c7e77', '#2d9f99', '#58c1bc', '#a1ded8', '#e4faf5'].reverse(),
      4: ['#289a95','#35b8b5','#afe3de','#e4faf5'].reverse(),
      3: ['#1c7e77', '#58c1bc', '#e4faf5'].reverse(),
      2: ['#bfede9', '#1c7e77'],
      /*6 : ['#003c30','#0f6259','#35b8b5','#228c86','#a0ded2','#d0eee8'].reverse(),
      5 : ['#003c30','#0f6259','#35b8b5','#228c86','#a0ded2'].reverse(),
      4 : ['#289a95','#31aeaa','#68c5c2','#b0e0dc'].reverse(),
      3 : ['#003c30','#35b8b5','#a0ded2'].reverse(),
      2 : ['#0f6259','#228c86'].reverse(),*/
      1: ['#35b8b5']
  };

  const orangeScale = {
    /*6: ['#f2d3a9', '#eaba82', '#e0a15c', '#d2893b', '#bf7328', '#ae5c17'],
    5: ['#f2d3a9', '#e8b379', '#da9549', '#c4792d', '#ae5c17'],
    4: ['#f2d3a9', '#e3a968', '#cb8134', '#ae5c17'],
    3: ['#f2d3a9', '#da9549', '#ae5c17'],
    2: ['#f3b76c', '#a55c1a'],*/
    1: ['#e8983a']
  };

  const partisanScaleD = {
      /*6: ['#295899', '#4771ad', '#668bbf', '#86a6d0', '#a7c1e0', '#c9dcef'].reverse(),
      5: ['#295899', '#4f78b2', '#7698c8', '#9ebadc', '#c9dcef'].reverse(),
      4: ['#295899', '#5c83b9', '#91aed5', '#c9dcef'].reverse(),
      3: ['#295899', '#7698c8', '#c9dcef'].reverse(),
      2: ['#c9dcef','#295899'],*/
      1: ['#3f8ac1']
  };
  const partisanScaleR = {
    /*6: ['#fee5d9', '#f9c0b1', '#ef9d8b', '#df7b69', '#cb5848', '#b4362b'],
    5: ['#fee5d9', '#f7b8a8', '#e78b79', '#d06151', '#b4362b'],
    4: ['#fee5d9', '#f3a997', '#d96f5e', '#b4362b'],
    3: ['#fee5d9', '#e78b79', '#b4362b'],
    2: ['#fee5d9', '#b4362b'],*/
    1: ['#cf4c49']

  };

  const independentScale = {
    1: ['#31a354'],
    2: ['#e5f5e0', '#31a354'],
    3: ["#e5f5e0","#a1d99b","#31a354"],
    4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
    5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
    6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"]
  };

  const strokeGreyScale = ["#aaa","#bbb","#cccccc","#ddd","#eee"].reverse();

  const greyScale = {
      1: ['#a9aaaa'],
      2: ['#f7f7f7', '#636363'],
      3: ['#f7f7f7', '#a9aaaa', '#636363'],
      4: ["#f7f7f7","#cccccc","#969696","#636363"],
      5: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363"],
      6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252"]
  };

  const lightGreyScale = {
      1: ['#cccccc'],
      2: ['#f7f7f7', '#969696'],
      3: ['#f7f7f7', '#a9aaaa', '#636363'],
      4: ["#f7f7f7","#cccccc","#969696","#636363"],
      5: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363"],
      6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252"]
  };

  /*const likelyRScale = { 1: ['#b4362b'] };
  const leanRScale = {1: ['#df7b69'] };
  const tossupScale = {1: ['#e39e4f'] };
  const leanDScale = {1: ['#668bbf'] };
  const likelyDScale = {1: ['#295899'] };


#f0cfd1 \
  #df9eb6 \
  #c96f9a \
  #b03c7b \
  #8e0152 \

  */

  /*const allcolors = [tealScale['5'],orangeScale['5'],partisanScaleR['5'],
    partisanScaleD['5'],independentScale['5'],greyScale['5'],likelyRScale['1'],
    leanRScale['1'],tossupScale['1'],leanDScale['1'],likelyDScale['1']];*/

  const allscales = [tealScale['5'],orangeScale['5'],partisanScaleR['5'],
    partisanScaleD['5'],independentScale['5'],greyScale['5']];

  const allscaleskey = [tealScale,orangeScale,partisanScaleR,partisanScaleD,independentScale,greyScale]

  /*const hatchtypes = [
                    {type:'lines',size:'3',stroke:'3'},
                    {type:'lines',size:'6',stroke:'3'},
                    {type:'lines',size:'10',stroke:'3'},
                    {type:'lines',size:'15',stroke:'3'},
                    {type:'lines',size:'20',stroke:'3'},
                    {type:'hatch',size:'4', stroke:'3'},
                    {type:'hatch',size:'7', stroke:'3'},
                    {type:'hatch',size:'10', stroke:'3'},
                    {type:'hatch',size:'15', stroke:'3'},
                    {type:'hatch',size:'20', stroke:'3'},
                    {type:'hexagons',size:'2', stroke:'3'},
                    {type:'hexagons',size:'4', stroke:'3'},
                    {type:'hexagons',size:'7', stroke:'3'},
                    {type:'hexagons',size:'10', stroke:'3'},
                    {type:'hexagons',size:'14', stroke:'3'},
                    {type:'circles',size:'5', radius:'1'},
                    {type:'circles',size:'5', radius:'2'},
                    {type:'circles',size:'7', radius:'2'},
                    {type:'circles',size:'10', radius:'3'},
                    {type:'circles',size:'14', radius:'3'},
                    {type : 'none'}];*/

 const colors = {
    0:tealScale,
    1:orangeScale,
    2:greyScale,
    3:partisanScaleD,
    4:partisanScaleR,
    5:independentScale,
    6:lightGreyScale
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
