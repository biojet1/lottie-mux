#!/usr/bin/env node
import('puppettievid/cli')
    .then(({ main }) => main())
    .catch((err) => {
        throw err;
    });