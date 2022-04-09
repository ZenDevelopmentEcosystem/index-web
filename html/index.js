
/**
 * Add headers to a table.
 * @param {Object} fragment HTML fragment to append headers to.
 * @param {Object[]} headers
 * @param {String} headers[].text - Heading text
 * @param {Number} headers[].width - Column width
 */
function setTableHeaders(fragment, headers) {
    var tableHead = $('<thead \>', { 'class': 'table-dark' });
    var headerRow = $('<tr/>');
    headers.forEach(header => headerRow.append($('<th \>', { 'style':`width: ${header.width}%` }).text(header.text)));
    headerRow.appendTo(tableHead);
    tableHead.appendTo(fragment);
}

function setTableSites(fragment, sites) {
    var tableBody = $('<tbody/>');
    sites.forEach(site => {
        var row = $('<tr/>');
        row.append($('<td/>').append($('<a \>', {
                'href': site.url, 'class': 'text-reset fw-bold' }).text(site.name)));
        row.append($('<td/>').append($('<a \>', {
                'href': site.url, 'class': 'text-reset' }).text(site.description)));
        row.appendTo(tableBody);
    });
    tableBody.appendTo(fragment);
}

/**
 * Restructures the data to a map where the key is the groupIds and the value the list
 * of sites (sorted alphabetical) that belong to that group.
 */
function dataByGroupId(data) {
    var groups = [...new Set(data.sites.map(site => site.group))]
        .sort((a, b) => a.localeCompare(b));
    var result = {}
    groups.forEach(groupId => {
        result[groupId] = data.sites.filter(site => site.group === groupId)
            .sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
}

/**
 * Restructure the data to a map where the key is the host(name) and the value
 * the list of sites (sorted alphabetical) that belong to that host.
 */
function dataByHost(data) {
    var hosts = hostsFromData(data);
    var result = {}
    hosts.forEach(hostName => {
        result[hostName] = data.sites.filter(site => site.host === hostName)
            .sort((a, b) => a.name.localeCompare(b.name));
    });
    return result;
}

/**
 * List of unique hosts sorted alphabetical from data.
 */
function hostsFromData(data) {
    return [...new Set(data.sites.map(site => site.host))]
        .sort((a, b) => a.localeCompare(b));
}

/**
 * Sort group list by order.
 * @param {Array} groups List of groups
 * @returns {Array} Groups sorted by the property "order"
 */
function transformGroups(groups) {
    return groups.sort((a, b) => a.order.toString().localeCompare(b.order.toString(), undefined, { numeric: true }));
}

function createSitesTable(fragment, name, sites) {
    $('<h2 \>', { 'class': 'mt-3 display-6'}).text(name).appendTo(fragment);
    var sitesTable = $('<table \>', { 'class': 'table table-striped table-fade-hover table-sm' });
    setTableHeaders(sitesTable, [ {text: 'Site', width: 25}, {text: 'Description', width: 75} ]);
    setTableSites(sitesTable, sites);
    sitesTable.appendTo(fragment);
}

/**
 * Create a new bootstrap tab
 * @param {Object} fragment HTML Fragment that will be rendered to.
 * @param {Array} tabsList List of Tabs objects
 */
function renderTabs(fragment, tabsList) {
    var wrapper = $('<div \>', { 'class': 'd-flex align-items-start w-100' });
    var tabList = $('<div \>', {
            'class': 'nav flex-column nav-pills me-4',
            'id':'vtablist',
            'role': 'tablist',
            'aria-orientation': 'vertical'
        });
    var tabContent = $('<div \>', { 'class': 'tab-content flex-column w-75', 'id': 'vtabcontent' });
    var tabIndex = 0;
    tabsList.forEach((tab) => {
        var button = $('<button />', {
                'class': 'nav-link',
                'id' :`tab${tabIndex}-button`,
                'data-bs-toggle': 'pill',
                'data-bs-target': `#tab${tabIndex}`,
                'type': 'button',
                'role': 'tab',
                'aria-controls': `tab${tabIndex}`,
                'aria-selected': 'false'
            }).text(tab.name);
        var pane = $('<div />', {
                'class': 'tab-pane fade',
                'id': `tab${tabIndex}`,
                'role': 'tabpanel',
                'aria-labelledby': `tab${tabIndex}-button`
            });
        pane.append(tab.content);
        tabList.append(button);
        tabContent.append(pane);
        tabIndex++;
    });
    wrapper.append(tabList);
    wrapper.append(tabContent);
    wrapper.appendTo(fragment);
}

function createTab(name, content) {
    return { 'name': name, 'content': content };
}

function createAllGroupsTab(data, config) {
    var fragment = new DocumentFragment();
    var transformedData = dataByGroupId(data);
    var groups = transformGroups(config.groups);
    groups.forEach((group) => createSitesTable(fragment, group.name, transformedData[group.id]));
    return createTab('By group', fragment);
}

function createAllHostsTab(data, config) {
    var fragment = new DocumentFragment();
    var transformedData = dataByHost(data);
    var hosts = hostsFromData(data);
    hosts.forEach((host) => createSitesTable(fragment, host || 'Unknown', transformedData[host]));
    return createTab('By host', fragment);
}

function createFlatGroupsTab(data, config) {
    var fragment = new DocumentFragment();
    var sites = data.sites.sort((a, b) => a.name.localeCompare(b.name));
    createSitesTable(fragment, '', sites);
    return createTab('Flat list', fragment);
}

function setSites(data, config) {
    var fragment = new DocumentFragment();
    if (data.sites.length > 0) {
        var tabs = [];
        if (config.allGroupsTab) {
            tabs.push(createAllGroupsTab(data, config));
        }
        if (config.allTHostsTab) {
            tabs.push(createAllHostsTab(data, config));
        }
        if (config.flatTab) {
            tabs.push(createFlatGroupsTab(data, config));
        }
        renderTabs(fragment, tabs);
    } else {
        $('<h2>').text('No sites in index, try again later').appendTo(fragment);
    }
    var content = $('#content');
    content.append(fragment);
    $('#vtablist button:eq(0)').tab('show');
}

function setTitle(title) {
    $(document).prop('title', title);
    $('#page-title').text(title);
}

function loadSites(index, config) {
    $.getJSON(index, (data) => setSites(data, config)).fail(
        (jqxhr, textStatus, error) => setErrorMessage(jqxhr, textStatus, error,
            'Failed to load site information!') );
}

function setConfig(data) {
    var cfg = data;
    var index = cfg.index || 'data/index.json';
    var title = cfg.title || 'Index';
    setTitle(title);
    loadSites(index, cfg);
}

function loadConfig() {
    $.getJSON('config/config.json', setConfig).fail(
        (jqxhr, textStatus, error) => setErrorMessage(jqxhr, textStatus, error,
            'Failed to load configuration!'));
}

function setErrorMessage( jqxhr, textStatus, error, context ) {
    var err = `Details: ${textStatus}, ${error}, ${jqxhr.getAllResponseHeaders()}`;
    console.error(`Request Failed: ${context}; ${err}`);
    $('#content').append($('<h2\>').text(context));
    $('#content').append($('<p\>').text(err));
};

$(document).ready(function(){
    loadConfig();
});
