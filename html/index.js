
var gConfig = null;
var gData = null;

function setTableHeaders(fragment, headers) {
    var headerRow = $('<tr/>');
    headerRow.addClass('header');
    $.each(headers, function(_, header) { headerRow.append($('<th></th>').text(header)); });
    headerRow.appendTo(fragment);
}

function setTableSites(fragment, sites) {
    $.each(sites, function(_, site) {
        var row = $('<tr/>');
        var siteCell = $('<td></td>')
        var link = $('<a>', {
            text: site.name,
            title: site.name,
            href: site.url
        });
        siteCell.append(link);
        row.append(siteCell);
        row.append($('<td></td>').text(site.description))
        row.appendTo(fragment);
    });
}

/**
 * Restructures the data to a map where the key is the groupIds and the value the list
 * of sites (sorted alphabetical) that belong to that group.
 */
function transformData(data) {
    var groups = [...new Set(data.sites.map(function(site) { return site.group; }))]
        .sort(function(a, b) { return a.localeCompare(b); });
    var result = {}
    $.each(groups, function(index, groupId) {
        result[groupId] = $.grep(data.sites, function(site) { return site.group === groupId; })
            .sort(function(a, b) { return a.name.localeCompare(b.name); });
    });
    return result;
}

function transformGroups(groups) {
    return groups.sort(function(a, b) { return a.order.toString().localeCompare(b.order.toString(), undefined, { numeric: true })});
}

function createGroupSitesTable(fragment, group, sites) {
    $('<h2>').text(group.name).appendTo(fragment);
    var sitesTable = $('<table>');
    setTableHeaders(sitesTable, ['Site', 'Description']);
    setTableSites(sitesTable, sites);
    sitesTable.appendTo(fragment);
}

function setSites(data) {
    gData = data;
    var fragment = new DocumentFragment();
    if (data.sites.length > 0) {
        if (gConfig.useGroups) {
            data = transformData(data);
            groups = transformGroups(gConfig.groups);
            $.each(groups, function(index, group) {
                createGroupSitesTable(fragment, group, data[group.id]);
            });
        } else {
            var sites = data.sites.sort(function(a, b) { return a.name.localeCompare(b.name) });
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
