const easyDailyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'clay',
      max: 20,
      min: 10,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 1000,
        min: 500
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 100,
        min: 50
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 10000,
    min: 5000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 100,
      min: 50
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 200,
    min: 100,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 1000,
      min: 500
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 100,
      min: 50
    }]
  }
}]

const easyWeeklyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'clay',
      max: 200,
      min: 100,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 7000,
        min: 3000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 300,
        min: 170
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 50000,
    min: 10000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 300,
      min: 170
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 1000,
    min: 700,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 7000,
      min: 3000
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 300,
      min: 170
    }]
  }
}]

const mediumDailyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'bricks',
      max: 30,
      min: 20,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 2000,
        min: 1000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 200,
        min: 100
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 17000,
    min: 13000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 200,
      min: 100
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 600,
    min: 300,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 15000,
      min: 1200
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 200,
      min: 100
    }]
  }
}]

const mediumWeeklyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'bricks',
      max: 60,
      min: 40,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 15000,
        min: 13000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 400,
        min: 200
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 70000,
    min: 30000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 400,
      min: 200
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 1600,
    min: 1000,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 15000,
      min: 12000
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 400,
      min: 200
    }]
  }
}]

const hardDailyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'bricks',
      max: 60,
      min: 40,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 10000,
        min: 5000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 400,
        min: 300
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 20000,
    min: 16000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 400
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 1000,
    min: 700,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 20000,
      min: 16000
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 400
    }]
  }
}]

const hardWeeklyQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'bricks',
      max: 100,
      min: 70,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 20000,
        min: 15000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 600,
        min: 300
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 90000,
    min: 50000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 450
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 3000,
    min: 2500,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 20000,
      min: 15000
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 440
    }]
  }
}]

const vipQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'bricks',
      max: 60,
      min: 40,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 10000,
        min: 5000
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 400,
        min: 300
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 20000,
    min: 16000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 400
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 1000,
    min: 700,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 20000,
      min: 16000
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 500,
      min: 400
    }]
  }
}]

const globalQuest = [{
  itemQuest: {
    title: `Collect {amount}x {item}`,
    possibleItems: [{
      itemId: 'clay',
      max: 20,
      min: 10,
      rewards: [{
        type: 'COINS',
        text: `{rewardAmount} coins`,
        max: 1000,
        min: 500
      }, {
        type: 'XP',
        text: `{rewardAmount} XP`,
        max: 100,
        min: 50
      }]
    }]
  }
}, {
  coinsQuest: {
    title: `Collect {amount} coins`,
    max: 10000,
    min: 5000,
    rewards: [{
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 100,
      min: 50
    }]
  }
}, {
  activityQuest: {
    title: `Complete {amount} activities`,
    max: 200,
    min: 100,
    rewards: [{
      type: 'COINS',
      text: `{rewardAmount} coins`,
      max: 1000,
      min: 500
    }, {
      type: 'XP',
      text: `{rewardAmount} XP`,
      max: 100,
      min: 50
    }]
  }
}]

module.exports = {
  easyDailyQuest,
  easyWeeklyQuest,
  mediumDailyQuest,
  mediumWeeklyQuest,
  hardDailyQuest,
  hardWeeklyQuest,
  globalQuest,
  vipQuest
}