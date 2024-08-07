#!/usr/bin/env node
import('lottie-mux/cli')
    .then(({ main }) => main())
    .catch((err) => {
        throw err;
    });