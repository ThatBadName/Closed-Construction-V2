const { ShardingManager } = require('discord.js')
const { token } = require('../config.json')

let manager = new ShardingManager('./src/bot.js', {
    token: token,
    totalShards: 'auto',
    respawn: true
})

manager.on('shardCreate', shard => {
    console.log(`[Sharding] Launched shard ${shard.id}`)
})

manager.spawn()