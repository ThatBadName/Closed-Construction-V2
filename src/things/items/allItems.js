const { emojis } = require('../constants')

module.exports = [{
        name: 'Cheese',
        description: 'It\'s just a block of cheese',
        sellPrice: 500,
        buyPrice: 0,
        tradeValue: 750,
        emoji: emojis.cheese,
        id: 'cheese',
        type: 'Sellable',
        rarity: 'Common',
        url: 'https://imgur.com/aF9VMiv.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Vote Box',
        description: 'Get some extra items when you vote at the weekend',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 1000,
        emoji: emojis.voteBox,
        id: 'vote box',
        type: 'Loot Box',
        rarity: 'Common',
        url: 'https://i.imgur.com/ZkskRyn.png',
        usable: true,
        marketable: true
    },
    {
        name: 'Developer Box',
        description: 'Get them rare items',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 100000000,
        emoji: emojis.devBox,
        id: 'developer box',
        type: 'Loot Box',
        rarity: 'Insane',
        url: 'https://i.imgur.com/TjeGl7D.png',
        usable: true,
        marketable: true
    },
    {
        name: 'XP Coin',
        description: 'This coin gives you a 50% XP boost for 1 hour',
        sellPrice: 1000000,
        buyPrice: 1500000,
        tradeValue: 1400000,
        emoji: emojis.xpCoin,
        id: 'xp coin',
        type: 'Power-Up',
        rarity: 'Uncommon',
        url: 'https://imgur.com/OjgbjtL.png',
        usable: true,
        marketable: true
    },
    {
        name: 'KSchlatt Coin',
        description: 'A Coin of KSchlatt\'s pfp given by the devs',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 1000000,
        emoji: emojis.schlattCoin,
        id: 'kschlatt coin',
        type: 'Collectable',
        rarity: 'Unfound',
        url: 'https://imgur.com/CN190J0.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Bad Coin',
        description: 'A dev item. If you own this you are legendary',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 100000000,
        emoji: emojis.badCoin,
        id: 'bad coin',
        type: 'Collectable',
        rarity: 'Unfound',
        url: 'https://imgur.com/ktTmVOY.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Funny dog',
        description: 'A Dog with mayo on its head',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 1500000,
        emoji: emojis.funnyDog,
        id: 'funny dog',
        type: 'Collectable',
        rarity: 'Rare',
        url: 'https://imgur.com/toqw5H2.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Shovel',
        description: 'Allows you to dig',
        sellPrice: 100,
        buyPrice: 15000,
        tradeValue: 14000,
        emoji: emojis.shovel,
        id: 'shovel',
        type: 'Tool',
        rarity: 'Common',
        url: 'https://imgur.com/kyYulbe.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Dev Coin',
        description: 'A coin from the devs. Why not use it?',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 1000000,
        emoji: emojis.devCoin,
        id: 'dev coin',
        type: 'Collectable',
        rarity: 'Rare',
        url: 'https://imgur.com/VT0PNjk.png',
        usable: true,
        marketable: true
    },
    {
        name: 'Cheque',
        description: 'A handy little cheque that will give you an extra bit of bank space',
        sellPrice: 0,
        buyPrice: 50000,
        tradeValue: 50000,
        emoji: emojis.cheque,
        id: 'cheque',
        type: 'Power-Up',
        rarity: 'Common',
        url: 'https://imgur.com/ziHIdlX.png',
        usable: true,
        marketable: true
    },
    {
        name: 'Scout',
        description: 'A simple image of scout',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 2500000,
        emoji: emojis.scout,
        id: 'scout',
        type: 'Power-Up',
        rarity: 'Rare',
        url: 'https://imgur.com/AmdBWTP.png',
        usable: true,
        marketable: true
    },
    {
        name: 'Rifle',
        description: 'Get one of these and go out to hunt',
        sellPrice: 10000,
        buyPrice: 20000,
        tradeValue: 15000,
        emoji: emojis.rifle,
        id: 'rifle',
        type: 'Tool',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Rocket Fuel',
        description: 'Load up your rocket and fly off to a new planet',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 10000,
        emoji: emojis.rocketFuel,
        id: 'rocket fuel',
        type: 'Craftable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Rocket',
        description: 'Needed to get to new planets',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 100000,
        emoji: emojis.rocket,
        id: 'rocket',
        type: 'Tool',
        rarity: 'Rare',
        url: '',
        usable: false,
        marketable: true //Need to change to true when added planets
    },
    {
        name: 'Super Computer',
        description: 'The brains for your rocket',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 100000,
        emoji: emojis.superComputer,
        id: 'super computer',
        type: 'Craftable',
        rarity: 'Rare',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Space Goo',
        description: 'A strange, sticky substance. It smells. Found from launching a rocket',
        sellPrice: 10000,
        buyPrice: 0,
        tradeValue: 10000,
        emoji: emojis.spaceGoo,
        id: 'space goo',
        type: 'Sellable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Plasma',
        description: 'Used to make weapons',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 40000,
        emoji: emojis.plasma,
        id: 'plasma',
        type: 'Craftable',
        rarity: 'Rare',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Air',
        description: 'How the...',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 1000,
        emoji: emojis.air,
        id: 'air',
        type: 'Craftable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Metal',
        description: 'Used to craft a rocket',
        sellPrice: 1000,
        buyPrice: 10000,
        tradeValue: 11000,
        emoji: emojis.metal,
        id: 'metal',
        type: 'Craftable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Wood',
        description: 'A useful material that can be crafted into many things',
        sellPrice: 500,
        buyPrice: 5000,
        tradeValue: 3000,
        emoji: emojis.wood,
        id: 'wood',
        type: 'Craftable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Plastic',
        description: 'An item found from fishing',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 150,
        emoji: emojis.plastic,
        id: 'plastic',
        type: 'Craftable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Tape',
        description: 'Found from digging, used to tape things together', //Make it so you can find while digging
        sellPrice: 200,
        buyPrice: 0,
        tradeValue: 250,
        emoji: emojis.tape,
        id: 'tape',
        type: 'Craftable',
        rarity: 'Uncommon',
        url: 'https://imgur.com/ivNgi2i.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Glue',
        description: 'Used to stick stuff to other stuff. Found in the ground',//Put in dig loot table
        sellPrice: 200,
        buyPrice: 0,
        tradeValue: 250,
        emoji: emojis.glue,
        id: 'glue',
        type: 'Craftable',
        rarity: 'Uncommon',
        url: 'https://imgur.com/cCrzLe8.png',
        usable: false,
        marketable: true
    },
    {
        name: 'String',
        description: 'Used to craft a space suit',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 200,
        emoji: emojis.string,
        id: 'string',
        type: 'Craftable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Control Unit',
        description: 'Necessary for making sure your rocket stays on course',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 10000,
        emoji: emojis.controlUnit,
        id: 'control unit',
        type: 'Tool',
        rarity: 'Rare',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Space Suit',
        description: 'Required to go onto other planets',
        sellPrice: 0,
        buyPrice: 0,
        tradeValue: 1000,
        emoji: emojis.spaceSuit,
        id: 'space suit',
        type: 'Collectable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Axe',
        description: 'Wanna cut down a tree? You need one of these',
        sellPrice: 5000,
        buyPrice: 10000,
        tradeValue: 7500,
        emoji: emojis.axe,
        id: 'axe',
        type: 'Tool',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Pickaxe',
        description: 'To go mining for minerals this could be helpful',
        sellPrice: 5000,
        buyPrice: 15000,
        tradeValue: 13000,
        emoji: emojis.pickaxe,
        id: 'pickaxe',
        type: 'Tool',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Pet Food',
        description: 'Required to keep your pet healthly',
        sellPrice: 0,
        buyPrice: 1000,
        tradeValue: 1500,
        emoji: emojis.petFood,
        id: 'pet food',
        type: 'Collectable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Ammo',
        description: 'Needed to keep your rifle loaded',
        sellPrice: 0,
        buyPrice: 100,
        tradeValue: 100,
        emoji: emojis.ammo,
        id: 'ammo',
        type: 'Tool',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Camera',
        description: 'Found while fishing. Doesn\'t work so might aswell sell it',
        sellPrice: 400,
        buyPrice: 0,
        tradeValue: 450,
        emoji: emojis.camera,
        id: 'camera',
        type: 'Sellable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Rubbish',
        description: 'A bag of smelly rubbish',
        sellPrice: 200,
        buyPrice: 0,
        tradeValue: 201,
        emoji: emojis.rubbish,
        id: 'rubbish',
        type: 'Sellable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Squid',
        description: 'Tasty food + Hungry customers = Money',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 105,
        emoji: emojis.squid,
        id: 'squid',
        type: 'Sellable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Fish',
        description: 'Fish and chips.',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 150,
        emoji: emojis.fish,
        id: 'fish',
        type: 'Sellable',
        rarity: 'Common',
        url: 'https://imgur.com/v3h1AZU.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Duck',
        description: 'Why do so many people want a pet duck?',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 150,
        emoji: emojis.duck,
        id: 'duck',
        type: 'Sellable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Snake',
        description: 'A bigger worm',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 150,
        emoji: emojis.snake,
        id: 'snake',
        type: 'Sellable',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Alien',
        description: 'Probably hopped onto your rocket while going through space. Why does it sell?',
        sellPrice: 1000,
        buyPrice: 0,
        tradeValue: 1500,
        emoji: emojis.alien,
        id: 'alien',
        type: 'Sellable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Fishing Rod',
        description: 'Used to go fishing in the river. Only helpfull on planets with water',
        sellPrice: 4000,
        buyPrice: 10000,
        tradeValue: 14000,
        emoji: emojis.fishingRod,
        id: 'rod',
        type: 'Tool',
        rarity: 'Common',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Pet Collar',
        description: 'Lets you give your pet a name',
        sellPrice: 750000,
        buyPrice: 1000000,
        tradeValue: 800000,
        emoji: emojis.petCollar,
        id: 'pet collar',
        type: 'Collectable',
        rarity: 'Rare',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Meteor',
        description: 'Found while traveling through space',
        sellPrice: 10000,
        buyPrice: 0,
        tradeValue: 11000,
        emoji: emojis.meteor,
        id: 'meteor',
        type: 'Sellable',
        rarity: 'Uncommon',
        url: '',
        usable: false,
        marketable: true
    },
    {
        name: 'Berries',
        description: 'You might get a good buff.... Or a bad one',
        sellPrice: 12000,
        buyPrice: 40000,
        tradeValue: 40000,
        emoji: emojis.berries,
        id: 'berries',
        type: 'Collectable',
        rarity: 'Uncommon',
        url: 'https://imgur.com/IifsgUx.png',
        usable: true,
        marketable: true
    },
    {
        name: 'Minerals',
        description: 'Can be sold for a hefty sum of cash',
        sellPrice: 6000,
        buyPrice: 0,
        tradeValue: 6500,
        emoji: emojis.minerals,
        id: 'minerals',
        type: 'Sellable',
        rarity: 'Uncommon',
        url: 'https://imgur.com/7gROPNF.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Rocks',
        description: 'Found while mining',
        sellPrice: 100,
        buyPrice: 0,
        tradeValue: 150,
        emoji: emojis.rocks,
        id: 'rocks',
        type: 'Sellable',
        rarity: 'Common',
        url: 'https://imgur.com/yOxqj2t.png',
        usable: false,
        marketable: true
    },
    {
        name: 'Gift Box',
        description: 'Can be used to gift items and coins to users',
        sellPrice: 0,
        buyPrice: 900000,
        tradeValue: 950000,
        emoji: emojis.giftBox,
        id: 'gift box',
        type: 'Special',
        rarity: 'Rare',
        url: 'https://i.imgur.com/1n07FtR.png',
        usable: true,
        marketable: true
    },
    {
        name: 'iHate Coin',
        description: 'Worth an incredible amount of cheese',
        sellPrice: 3000000,
        buyPrice: 0,
        tradeValue: 3500000,
        emoji: emojis.iHateCoin,
        id: 'ihate coin',
        type: 'Collectable',
        rarity: 'Super Rare',
        url: 'https://i.imgur.com/q7QI49L.png',
        usable: false,
        marketable: true
    },
]