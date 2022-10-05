var { nconf } = require('./config.js');

function getGroups(showHidden = false) {
    let groups = [];
    for (let group in nconf.get('groups')) {
        if (nconf.get('groups')[group].visible || showHidden) {
            groups.push(group);
        };
    };
    return groups;
};

function getGroupMembers(group) {
    return nconf.get('groups')[group]["members"];
};

function getGroupsWithMember(member) {
    const groups = getGroups();
    const groupsWithMember = [];
    for (let group of groups) {
        if (getGroupMembers(group).includes(member)) {
            groupsWithMember.push(group);
        };
    };
    return groupsWithMember;
};

function addMemberToGroup(group, member, privileged = false) {
    if (!nconf.get('groups')[group]["joinable"] && !privileged) {
        return false;
    };
    nconf.get('groups')[group]["members"].push(member);
    nconf.save();
    return true;
};

function removeMemberFromGroup(group, member, privileged = false) {
    if (!nconf.get('groups')[group]["leavable"] && !privileged) {
        return false;
    };
    const index = nconf.get('groups')[group]["members"].indexOf(member);
    if (index > -1) {
        nconf.get('groups')[group]["members"].splice(index, 1);
    };
    nconf.save();
    return true;
};

module.exports = {
    getGroups: getGroups,
    getGroupMembers: getGroupMembers,
    addMemberToGroup: addMemberToGroup,
    removeMemberFromGroup: removeMemberFromGroup,
    getGroupsWithMember: getGroupsWithMember,
};