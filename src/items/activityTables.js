const { emojis } = require('../constants')

module.exports = [
  {
    boxId: 'scavenge',
    possible: [
      {
        id: 'COINS',
        fileId: '',
        name: '',
        emoji: '',
        maxAmount: 1000,
        minAmount: 500,
        chance: 10
      }, {
        id: 'NOTHING',
        fileId: '',
        name: '',
        emoji: '',
        maxAmount: 0,
        minAmount: 0,
        chance: 20
      }, {
        id: 'clay',
        fileId: 'clay',
        name: 'Clay',
        emoji: emojis.clay,
        maxAmount: 3,
        minAmount: 1,
        chance: 15
      }, {
        id: 'plastic',
        fileId: 'plastic',
        name: 'Plastic',
        emoji: emojis.plastic,
        maxAmount: 3,
        minAmount: 1,
        chance: 15
      }, {
        id: 'wood',
        fileId: 'wood',
        name: 'Wood',
        emoji: emojis.wood,
        maxAmount: 3,
        minAmount: 1,
        chance: 20
      }, {
        id: 'metal',
        fileId: 'metal',
        name: 'Metal',
        emoji: emojis.metal,
        maxAmount: 3,
        minAmount: 1,
        chance: 10
      }, {
        id: 'spare parts',
        fileId: 'spareParts',
        name: 'Spare Parts',
        emoji: emojis.spareParts,
        maxAmount: 3,
        minAmount: 1,
        chance: 9
      }, {
        id: 'LOOSEPARTY',
        fileId: '',
        name: '',
        emoji: '',
        maxAmount: 10,
        minAmount: 1,
        chance: 1
      },
    ]
  },
]