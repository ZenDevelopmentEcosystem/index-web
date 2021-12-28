
var gConfig = null;
var gData = null;

/**
 * Add headers to a table.
 * @param {Object} fragment HTML fragment to append headers to.
 * @param {Object[]} headers
 * @param {String} headers[].text - Heading text
 * @param {Number} headers[].width - Column width
 */
function setTableHeaders(fragment, headers) {
    var tableHead = $('<thead class="table-dark"/>');
    var headerRow = $('<tr/>');
    headers.forEach(header => headerRow.append($(`<th style="width: ${header.width}%"></th>`).text(header.text)));
    headerRow.appendTo(tableHead);
    tableHead.appendTo(fragment);
}

function setTableSites(fragment, sites) {
    var tableBody = $('<tbody/>');
    sites.forEach(site => {
        var row = $(`<tr/>`);
        row.append($('<td/>').append($(`<a href="${site.url}" class="text-reset fw-bold"/>`).text(site.name)));
        row.append($('<td/>').append($(`<a href="${site.url}" class="text-reset"/>`).text(site.description)));
        row.appendTo(tableBody);
    });
    tableBody.appendTo(fragment);
}

/**
 * Restructures the data to a map where the key is the groupIds and the value the list
 * of sites (sorted alphabetical) that belong to that group.
 */
function transformData(data) {
    var groups = [...new Set(data.sites.map(site => site.group))]
        .sort((a, b) => a.localeCompare(b));
    var result = {}
    groups.forEach(groupId => {
        result[groupId] = data.sites.filter(site => site.group === groupId)
            .sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
}

function transformGroups(groups) {
    return groups.sort((a, b) => a.order.toString().localeCompare(b.order.toString(), undefined, { numeric: true }));
}

function createGroupSitesTable(fragment, group, sites) {
    $('<h2 class="mt-3 display-6">').text(group.name).appendTo(fragment);
    var sitesTable = $('<table class="table table-striped table-fade-hover table-sm">');
    setTableHeaders(sitesTable, [
        {text: 'Site', width: 20},
        {text: 'Description', width: 80}
    ]);
    setTableSites(sitesTable, sites);
    sitesTable.appendTo(fragment);
}

function setSites(data) {
    gData = data;
    var fragment = new DocumentFragment();
    if (data.sites.length > 0) {
        if (gConfig.useGroups) {
            data = transformData(data);
            var groups = transformGroups(gConfig.groups);
            groups.forEach(group => createGroupSitesTable(fragment, group, data[group.id]));
        } else {
            var sites = data.sites.sort((a, b) => a.name.localeCompare(b.name));
            var group = { name: "" };
            createGroupSitesTable(fragment, group, sites);
        }
    } else {
        $('<h2>').text('No sites in index, try again later').appendTo(fragment);
    }
    var content = $('#content');
    content.append(fragment);
}

function loadSites(index) {
    $.getJSON(index, setSites).fail(setErrorMessage);
}

function setConfig(cfg) {
    gConfig = cfg;
    var index = cfg.index || 'data/index.json';
    loadSites(index);
}

function loadConfig() {
    $.getJSON('config/config.json', setConfig).fail(setErrorMessage);
}

function setErrorMessage( jqxhr, textStatus, error ) {
    var err = textStatus + ', ' + error + ', ' + jqxhr.getAllResponseHeaders();
    console.error( 'Request Failed: ' + err );
    $('#content').append($('<h2>').text(err).addClass('error'));
};

$(document).ready(function(){
    loadConfig();
});
