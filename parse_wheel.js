const endpoint = "https://api.github.com/repos/abathargh/python3-arm-wheels/contents/";
const resultsId = "results";
const base = "wheels";

let tree;

window.onload = async function () {
    tree = await fromEndpoint(base);
    console.log(tree);
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

function queryWheel(query) {
    if (query === "" || query.length === 0) return [];

    let dir = tree;
    const queryBits = query.split(":");

    for (const [index, bit] of queryBits.entries()) {
        const target = dir.content.filter(x => x.name.includes(bit));
        const exactHit = target.find(x => x.name === bit);

        if (exactHit !== undefined) {
            if (index === queryBits.length - 1) return [exactHit];
            dir = exactHit; // check for dir or file
            continue;
        }
        return target;
    }
    return [];
}

function showWheels(query) {
    const queryResult = queryWheel(query);
    let resultsDiv = document.getElementById(resultsId);
    if (!Array.isArray(queryResult) || queryResult.length === 0) resultsDiv.innerHTML = "";

    resultsDiv.innerHTML = "<ul>" + queryResult.map(
        x => {
            return "<li>" +
                ("url" in x ? "<a href=\"" + x.url + "\">" + x.name + "</a>" : x.name)
                + "</li>";
        }
    ).join("") + "</ul>";
}