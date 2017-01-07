module.exports = {
    events: {
        "!day": {
            command: 'day',
            cost: 1,
            help: 'Command the sun to its morning position.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/time set 0'
                        ]
                    }
                }
            ]
        },
        "!night": {
            command: 'night',
            cost: 1,
            help: 'Summon the moon into the sky.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/time set 12000'
                        ]
                    }
                }
            ]
        },
        "!rain": {
	        command: 'rain',
            cost: 1,
            help: 'Make it rain!',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/weather rain'
                        ]
                    }
                }
            ]
	    },
        "!clear": {
            command: 'clear',
            cost: 1,
            help: 'Clear the weather.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/weather clear'
                        ]
                    }
                }
            ]
        },
        "!blindness": {
            command: 'blindness',
            cost: 1,
            help: 'Strike player blind.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/effect @a blindness'
                        ]
                    }
                },
                {
                    delay: 2,
                    say: {
                        where: 'minecraft',
                        text: [
                            'The god $0 has striken the world blind for it\'s sins!',
                            '$0 has cursed you with blindness.',
                            'Struck blind! The evil god $0 laughs at your troubles.'
                        ]
                    }
                }
            ],
        },
        "!slowness": {
            command: 'slowness',
            cost: 1,
            help: 'Decreases walking spead.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/effect @a slowness'
                        ]
                    }
                },
                {
                    delay: 2,
                    say: {
                        where: 'minecraft',
                        text: [
                            '$0 feels that you rush too quickly through life.',
                            '$0 has cursed you with slowness.',
                            'Slow down! The evil god $0 laughs at your troubles.'
                        ]
                    }
                }
            ],
        },
        "!mining_fatigue": {
            command: 'mining_fatigue',
            cost: 1,
            help: 'Decreases mining and attack speed.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/effect @a mining_fatigue'
                        ]
                    }
                },
                {
                    delay: 2,
                    say: {
                        where: 'minecraft',
                        text: [
                            'Your Muscles begin to suddly feel week...',
                            '$0 grows jealous of the strength of mankind!'
                        ]
                    }
                }
            ],
        },
        "!pigman": {
            command: 'pigman',
            cost: 1,
            help: 'Conjur warrior pigman riding a skeleton horse.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/execute @a ~ ~ ~ /summon minecraft:skeleton_horse ~ ~1 ~ {Passengers:[{id:"minecraft:zombie_pigman",CustomName:"Warrior of $0",CustomNameVisible:1,Glowing:1,Health:1,HandItems:[{id:"minecraft:iron_sword",Count:1},{}]}]}'
                        ]
                    }
                }
            ]
        },
        "!slime": {
            command: 'slime',
            cost: 1,
            help: 'Summon evil attack slimes to annoy our adventurer.',
            responses: [
                {
                    delay: 0,
                    say: {
                        where: 'minecraft',
                        text: [
                            '/execute @a ~ ~ ~ summon minecraft:slime ~ ~1 ~ {Size:0,CustomName:"$0 Slime",CustomNameVisible:1,Glowing:1}'
                        ]
                    }
                }
            ]
        }
    }
};

