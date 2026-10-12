const pick = (obj,allowedKeys)=>
    Object.fromEntries(
        Object.entries(obj??{}).filter(
            ([key,value])=>allowedKeys.includes(key)
        )
    );

export default pick;