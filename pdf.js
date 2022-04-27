const { exec } = require('child_process');

let INDEX = 0;
const table = [];
const erroredData = [];

(async function () {
    const pdfFile = "/Users/krypton/Downloads/medak.pdf";
    const opDir = "/Users/krypton/Desktop/op3";
    const fileName = "image_"
    try {
        //const p = await execute(`python3 p.py ${pdfFile} ${opDir} ${fileName}`);
        const pageData = await execute(`tesseract ${opDir + '/' + fileName}3.jpg - -l eng --psm 11 -c preserve_interword_spaces=1`);
        const allData = pageData.split('\n').filter(n => n !== "" && n !== 'Available' && n !== "Photo is");
        table.push(readMetadata(allData));
        while (INDEX < allData.length - 3) {
            table.push(readEpicId(allData));
            table.push(readName(allData));
            table.push(readGuardianName(allData));
            table.push(readHouseNumber(allData));
            table.push(readAgeAndGender(allData));
        }

        for (let extra of erroredData) {
            table[extra.at[0]][extra.at[1]] += " " + extra.value;
        }

        const json = convertTableDataToJSON();

        //console.log(table);
        //console.log(json.length, "voters\n");
        console.log(JSON.stringify(json));
        //console.log(table);
        //console.log(erroredData);
    } catch (e) {
        console.log("Error", e);
    }
})();

function execute(command) {
    return new Promise(function (resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (!error) {
                resolve(stdout);
            } else {
                reject(error || stderr);
            }
        });
    });
}

function convertIntoTableData(allData) {
    const table = [];
    let colCount = 0;
    let row = [];
    for (let col of allData) {
        row[colCount++] = col;
        if (colCount === 3) {
            table.push(row);
            row = [];
            colCount = 0;
        }
    }
    console.log(table);
    return table;
}


function readMetadata(arr) {
    const row = [];
    row.push(arr[INDEX++]);
    row.push(arr[INDEX++]);
    row.push(arr[INDEX++]);
    return row;
}


function readEpicId(arr) {
    return _read(arr, /[a-zA-Z0-9]{10}/, 'epic');
}

function readName(arr) {
    return _read(arr, /^Name\s?:?-?/, 'name');
}

function readGuardianName(arr) {
    return _read(arr, /^(Husband|Father)/, 'gaurdian');
}

function readHouseNumber(arr) {
    return _read(arr, /^House/, 'house');
}

function readAgeAndGender(arr) {
    return _read(arr, /^Age/, 'age');
}



function _read(arr, regex, type) {
    const row = [];
    while (row.length < 3) {
        const value = arr[INDEX++];
        if (regex.test(value)) {
            row.push(value);
        } else {
            erroredData.push({
                value,
                at: [table.length - 1, row.length],
                type
            });
        }
    }
    return row;
}


function convertTableDataToJSON() {
    const splitter = /\s?[:-]\s?/;
    const voters = [];
    const [assembly, , section] = table[0];
    let users = newUsers();
    let rowNum = 0;
    for (let i = 1; i < table.length; i++) {
        const row = table[i];
        for (let k = 0; k < row.length; k++) {
            const col = row[k];
            const user = users[k];
            if (rowNum === 0) {
                user.epicId = col;
            } else if (rowNum === 1) {
                setName(user, col);
            } else if (rowNum === 2) {
                setGaurdian(user, col);
            } else if (rowNum === 3) {
                setHouseNo(user, col);
            } else if (rowNum === 4) {
                setAgeAndGender(user, col);
            }
        }
        rowNum++;
        if (rowNum === 5) {
            rowNum = 0;
            voters.push(...users);
            users = newUsers();
        }
    }

    return voters;

    function newUsers() {
        return [getEmptyUser(assembly, section), getEmptyUser(assembly, section), getEmptyUser(assembly, section)];
    }

    function setName(user, v) {
        user.name = v.split(splitter)[1];
    }

    function setAgeAndGender(user, v) {
        const [, age, gender] = /Age:?-?\s*([0-9]+)\s*Gender:?-?\s*([A-Z]+)/.exec(v);
        user.age = age;
        user.gender = gender;
    }

    function setGaurdian(user, v) {
        const [key, val] = v.split(splitter);
        if (/^Fat/.test(key.trim())) {
            user.fathersName = val.trim();
        } else {
            user.husbandsName = val.trim();
        }
    }

    function setHouseNo(user, v) {
        user.houseNumber = v.split(/\s?:\s?/)[1];
    }

    function getEmptyUser(assembly, section) {
        const constit = assembly.split(/\s[:]\s/)[1];
        const booth = section.split(/\s[:]\s/)[1];
        return {
            name: '',
            age: '',
            epicId: '',
            fathersName: '',
            husbandsName: '',
            gender: '',
            houseNumber: '',
            constituency: constit,
            booth
        };
    }
}