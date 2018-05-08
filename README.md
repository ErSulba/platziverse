# Platziverse-db

## Ussage

``` js
const setupDatBase= require('platziverse-db')

setupDatabase(config).then(db => {
    const { Agent, Metric } = db
}).catch(err => console.error(err))
```