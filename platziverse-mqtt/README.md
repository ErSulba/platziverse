# platziverse-mqtt

## `agent/connected`

``` js
{
    agent: {
        uuid, //auto generate
        username, // defined in configuration
        name, // defined in configuration
        hostname, // obtained by the O.S
        pid // obtained from the process
    }
}
```

## `agent/disconnected`

``` js
{
    agent: {
        uuid
    }
}
```

## `agent/message`

``` js
{
    agent,
    metrics: [
        {
            type,
            value
        }
    ],
    timestamp // generated when we create the message
}
```