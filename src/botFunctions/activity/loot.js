async function generateLootTable(boxId) {
  const boxes = require('../../items/activityTables')

  const search = !!boxes.find((value) => value.boxId === boxId)
  if (!search) return
  const itemFound = boxes.find((value) => value.boxId === boxId)

  const lootTable = itemFound.possible
  let amountOfItems = 1
  let rewardArray = []
  for (let a = 0; a < amountOfItems; ++a) {
      let random = await chooseRandomItem(lootTable)
      rewardArray.push(random)
  }
  return rewardArray

  async function chooseRandomItem(lootTable) {
      let picked = null;
      let roll = Math.floor(Math.random() * 100);
      for (let i = 0, len = lootTable.length; i < len; ++i) {
          const loot = lootTable[i];
          const {
              chance
          } = loot;
          if (roll < chance) {
              picked = loot;
              let returned = picked
              return returned
          }
          roll -= chance;
      }
  }
}

module.exports = {
  generateLootTable
}