const colours = {
  cpPurple: 'a744fc',
  alert: 'ff8400',
  error: 'd40700',
  blend: '2f3136',
  warn: 'ffb300',
  success: '00cf0a',
}

const emojis = {
  nothing: '<:Fail:1018574493540696085>',
  devCoin: '<:DeveloperCoin:1005438384765947904>',
  funnyDog: '<:FunnyDog:1006293232780587178>',
  devBox: '<:DeveloperBox:1021450102008709182>',
  cheque: '<:Cheque:1005448240663117854>',
  voteBox: '<:VoteBox:1021423645769351329>',
  cheese: '<:Cheese:1005438383570571294>',
  xpCoin: '<:XPCoin:1005438386787582084>',
  schlattCoin: '<:kschlatt:1005522229511077921>',
  badCoin: '<:ThatBadName:1005583434921545788>',
  shovel: '<:Shovel:1005438385881620501>',
  devCoin: '<:DeveloperCoin:1005438384765947904>',
  scout: '<:Scout:1005521226887864480>',
  rifle: '',
  rocketFuel: '',
  rocket: '',
  superComputer: '',
  spaceGoo: '',
  plasma: '',
  air: '',
  metal: '',
  wood: '',
  plastic: '',
  tape: '<:DuctTape:1006293231476166737>',
  glue: '<:Glue:1006637919873806416>',
  string: '',
  controlUnit: '',
  spaceSuit: '',
  axe: '',
  pickaxe: '',
  petFood: '',
  ammo: '',
  camera: '',
  rubbish: '',
  squid: '',
  fish: '<:Fish:1006637918095413339>',
  duck: '',
  snake: '',
  alien: '',
  fishingRod: '',
  petCollar: '',
  meteor: '',
  berries: '<:Berries:1006621693009215559>',
  minerals: '<:Minerals:1006628025552609450>',
  rocks: '<:Rocks:1006628026739589270>',
  giftBox: '<:GiftBox:1021465688797364254>',
  iHateCoin: '<:iHateCoin:1021407682290258021>'
}

const begLocations = [
  `An old woman felt sorry for you and gave you \`{amount}\` coins`,
  `You begged a tree for cash and somehow got \`{amount}\` coins`,
  `You did an @everyone ping begging for cash and the server paid you \`{amount}\` coins to stop`,
  `Your begging paid off. You got \`{amount}\` coins`,
  `You begged and \`{amount}\` coins appeared`,
  `You asked KSchlatt for coins and he gave you \`{amount}\``
]

const reasonsToBreakShovel = [
  'Your shovel hit a rock and shattered into pieces',
  'Some mole decided to grab your shovel and hide it',
  'Your hands got sweaty and you dropped your shovel. You got too lazy to pick it up so you went home',
  'You left your shovel at home and a beaver ate it',
  'You met Bad in the quary and he took your shovel',
  'KSchlatt decided to prank you but it went a bit far.. You lost your shovel'
]

const randomItemsDig = [
  `funny dog,<:FunnyDog:1006293232780587178>,Funny Dog`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `glue,<:Glue:1006637919873806416>,Glue`,
]

const reasonsToBreakRod = [
  `A fish ate your bait, and the fishing wire, and the rod. HOW????`,
  `You got pushed into the river by a stranger. You got out but you lost your fishing rod`,
  `Lol ur fishing rod broke. Mabye get a better one next time`,
  `A dog came and took your fishing rod thinking it was a stick`,
  `You decided to fish under a tree. Not a surprise that your rod got stuck. You went home with nothing`,
  `You dropped your fishing rod into the river, it floated away`
]

const randomItemsFish = [
  `wood,<:ImageNotFound:1005453599800840262>,Wood`,
  `plastic,<:ImageNotFound:1005453599800840262>,Plastic`,
  `string,<:ImageNotFound:1005453599800840262>,String`,
  `camera,<:ImageNotFound:1005453599800840262>,Camera`,
  `squid,<:ImageNotFound:1005453599800840262>,Squid`,
  `fish,<:Fish:1006637918095413339>,Fish`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`
]

const reasonsToBreakAxe = [
  `A wolf came and stole your axe`,
  `You ate some berries that made you feel sick, you went home leaving your axe in the woods`,
  `You tried to cut some wood that was too hard`,
  `You lost your axe`
]

const randomItemsForage = [
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  `string,<:ImageNotFound:1005453599800840262>,String`,
  `glue,<:Glue:1006637919873806416>,Glue`,
  `tape,<:DuctTape:1006293231476166737>,Tape`,
  `wood,<:ImageNotFound:1005453599800840262>,Wood`,
  `metal,<:ImageNotFound:1005453599800840262>,Metal`,
  `plastic,<:ImageNotFound:1005453599800840262>,Plastic`,
  `camera,<:ImageNotFound:1005453599800840262>,Camera`,
]

const reasonsToBreakGun = [
  `Your rifle got jammed and you threw it agains a rock in fustration`,
  `Your rifle decided that it would no longer work`,
  `You dropped your rifle down a very big hole. Not sure it's possible to get it back`,
  `A bear stole your rifle off you`,
  `You were so bad at aiming you smashed your rifle against a rock`
]

const randomItemsHunt = [
  `scout,<:Scout:1005521226887864480>,Scout`,
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  `berries,<:Berries:1006621693009215559>,Berries`,
  `snake,<:ImageNotFound:1005453599800840262>,Snake`,
  `duck,<:ImageNotFound:1005453599800840262>,Duck`,
  `rubbish,<:ImageNotFound:1005453599800840262>,Rubbish`,
  
]

const reasonsToBreakPick = [
  `A very hard rock made your pick get stuck`,
  `Your torch blew out and you lost your pick`,
  `You snapped the handle off your pick`
]

const randomItemsMine = [
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `minerals,<:Minerals:1006628025552609450>,Minerals`
]

const randomItemsMineMars = [
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `rocks,<:Rocks:1006628026739589270>,Rocks`,
  `minerals,<:Minerals:1006628025552609450>,Minerals`
]



module.exports = {
  colours,
  emojis,
  begLocations,
  reasonsToBreakShovel,
  randomItemsDig,
  reasonsToBreakRod,
  randomItemsFish,
  reasonsToBreakAxe,
  randomItemsForage,
  reasonsToBreakGun,
  randomItemsHunt,
  reasonsToBreakPick,
  randomItemsMine,
  randomItemsMineMars
}