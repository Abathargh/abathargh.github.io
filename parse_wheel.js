const endpoint = "https://api.github.com/repos/abathargh/python3-arm-wheels/contents/";
const resultsId = "results";
const base = "wheels";

let tree;

window.onload = async function () {
    tree = await fromEndpoint(base);
}

function isDir(elem) {
    return elem.type === "dir";
}

async function fromEndpoint(level) {
    const resp = await fetch(endpoint + level, { "User-Agent": "test" });
    const arr = await resp.json();
    if (!Array.isArray(arr)) {
        return;
    }
    const splitted = level.split("/");
    const levelName = splitted[splitted.length - 1];
    return {
        name: levelName, content: await Promise.all(arr.map(
            async (x) => {
                if (isDir(x)) {
                    return await fromEndpoint(level + "/" + x.name);
                } else {
                    return { name: x.name, url: x.download_url };
                }
            }
        ))
    };
}

function setDir(name) {
    const searchField = document.getElementById("searchField");
    const partialQuery = searchField.value;
    const scIdx = partialQuery.lastIndexOf(":");
    if (scIdx === -1)
        searchField.value = name + ":";
    else
        searchField.value = partialQuery.substring(0, scIdx) + ":" + name + ":";
    showWheels(searchField.value);
}

function previousDir() {
    const searchField = document.getElementById("searchField");
    const partialQuery = searchField.value;
    const scIdx = partialQuery.lastIndexOf(":");
    if (scIdx === -1)
        searchField.value = "";
    else
        searchField.value = partialQuery.substring(0, scIdx);
    showWheels(searchField.value);
}

function queryWheel(query) {
    if (query === "" || query.length === 0) return [];

    let dir = tree;
    const queryBits = query.split(":");

    for (const [index, bit] of queryBits.entries()) {
        const target = dir.content.filter(x => x.name.includes(bit));
        const exactHit = target.find(x => x.name === bit);
        if (exactHit === undefined) return target;
        if (index === queryBits.length - 1) return [exactHit];
        dir = exactHit; // check for dir or file
    }
    return [];
}

function showWheels(query) {
    const queryResult = queryWheel(query);
    let resultsDiv = document.getElementById(resultsId);
    if (!Array.isArray(queryResult) || queryResult.length === 0) { resultsDiv.innerHTML = ""; return; }

    resultsDiv.innerHTML = "<ul>" + queryResult.map(
        x => {
            return "<li>" +
                ("url" in x ? String.raw`<a href="` + x.url + `">` + x.name + `</a>` :
                    String.raw`<a href="#" onclick="setDir('` + x.name + `')">` + x.name + `</a>`)
                + "</li>";
        }
    ).join("") +
        String.raw`<li style="list-style:square;"><a style="color: #008874;" href="#" onclick="previousDir()">Previous dir</a></li></ul>`;
}