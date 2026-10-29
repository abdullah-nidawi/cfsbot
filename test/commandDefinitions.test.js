const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function commandFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(directory, entry.name);
        return entry.isDirectory() ? commandFiles(entryPath) : entryPath.endsWith(".js") ? [entryPath] : [];
    });
}

test("all slash command modules build valid, uniquely named definitions", () => {
    const files = commandFiles(path.join(__dirname, "../src/commands"));
    const names = files.map((file) => {
        const command = require(file);
        assert.ok(command.data, `${file} exports command data`);
        assert.equal(typeof command.run, "function", `${file} exports a run function`);
        const definition = command.data.toJSON();
        assert.ok(definition.description, `${file} has a description`);
        return definition.name;
    });

    assert.equal(new Set(names).size, names.length, "slash command names are unique");
});
