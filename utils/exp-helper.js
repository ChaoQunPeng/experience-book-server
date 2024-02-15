/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2024-02-01 16:40:17
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-14 09:43:46
 * @FilePath: /experience-book-server/utils/exp-helper.js
 * @Description:
 */
function getPhaseInfo(totalExp) {
  if (totalExp >= 0 && totalExp < 1000) {
    const expRange = [
      [0, 199],
      [200, 399],
      [400, 599],
      [600, 799],
      [800, 999]
    ];
    return getLevelInfo(totalExp, expRange, '新手', 199);
  } else if (totalExp >= 1000 && totalExp < 3000) {
    const expRange = [
      [1000, 1399],
      [1400, 1799],
      [1800, 2199],
      [2200, 2599],
      [2600, 2999]
    ];
    return getLevelInfo(totalExp, expRange, '熟练者', 399);
  } else if (totalExp >= 3000 && totalExp < 6000) {
    const expRange = [
      [3000, 3599],
      [3600, 4199],
      [4200, 4799],
      [4800, 5399],
      [5400, 5999]
    ];
    return getLevelInfo(totalExp, expRange, '胜任者', 599);
  } else if (totalExp >= 6000 && totalExp < 10000) {
    const expRange = [
      [6000, 6799],
      [6800, 7599],
      [7600, 8399],
      [8400, 9199],
      [9200, 9999]
    ];
    return getLevelInfo(totalExp, expRange, '精通者', 799);
  } else if (totalExp > 10000) {
    return { name: '专家', level: '' };
  }
}

/**
 * @description:
 * @param {*} totalExp
 * @param {*} expRange
 * @param {*} levelName
 * @param {*} levelExp 每个等级之间的经验间隔
 * @return {*}
 */
function getLevelInfo(totalExp, expRange, levelName, levelExp) {
  const data = {
    name: levelName,
    level: 0, // 当前阶段的等级
    romanNum: 0,
    levelBaseExp: levelExp,
    currentExp: 0, // 当前等级的经验。 例如：总经验200，当前等级经验就是新手2星 1exp/199exp
    range: [],
    width: {} // 赋值给:style
  };

  const colorMaps = {
    新手: 'black-85',
    熟练者: 'blue',
    胜任者: 'red',
    精通者: 'purple',
    专家: 'black'
  };

  for (let i = 0; i < expRange.length; i++) {
    if (totalExp >= expRange[i][0] && totalExp <= expRange[i][1]) {
      switch (i) {
        case 0:
          data.romanNum = 'I';
          break;
        case 1:
          data.romanNum = 'II';
          break;
        case 2:
          data.romanNum = 'III';
          break;
        case 3:
          data.romanNum = 'IV';
          break;
        case 4:
          data.romanNum = 'V';
          break;
      }

      data.level = i + 1;

      if (i == 0) {
        data.currentExp = totalExp - expRange[i][0];
      } else {
        data.currentExp = totalExp - (expRange[i][0] - 1);
      }

      data.range = expRange[i];
      data.color = colorMaps[levelName];
    }
  }

  return data;
}

module.exports = {
  getPhaseInfo
};
