//Library from Google

function delay(delay) {
    // resolve, reject
    return new Promise((succ, err) => {
        setTimeout(() => {
            try {
                const v = Math.random();
                //throw new Error("boom");
                succ(v);
            } catch (e) {
                err(e)
            }
        }, delay);
    })
}


(async function main() {
    try {
        const value = await delay(2000);
        afterDelay(value);
    } catch (e) {
        console.log("main", e);
    }
})();


//async await => syntactic sugar



/*
delay(2000).then(d => { //cb1
    afterDelay(d);
}).catch(e => { //cb2
    console.log("Error occured");
}).finally(() => { //cb3
    console.log("Super Done")
});

console.log("done");*/

function afterDelay(data) {
    console.log('data', data);
}


/** I-IOC */

/**
 * 1. no guarantee that the callback 
 *    will be called [solved]
 * 2. what if something goes wrong
 * 3. No way to handle error [solved]
 */