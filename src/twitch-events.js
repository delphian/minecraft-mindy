module.exports = {
    events: {
        "blindness": {
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
                            'Struck blind! The evil god $0 laughts at your troubles.'
                        ]
                    }
                }
            ],
        }
    }
};

