var { nconf } = require('./config.js');

function getGroups() {
    return Object.keys(nconf.get('groups'));
}

function getGroupMembers(group) {
    return nconf.get('groups')[group];
}

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

function addMemberToGroup(group, member) {
    nconf.get('groups')[group].push(member);
    nconf.save();
};

function removeMemberFromGroup(group, member) {
    const index = nconf.get('groups')[group].indexOf(member);
    if (index > -1) {
        nconf.get('groups')[group].splice(index, 1);
    };
    nconf.save();
}

module.exports = {
    getGroups: getGroups,
    getGroupMembers: getGroupMembers,
    addMemberToGroup: addMemberToGroup,
    removeMemberFromGroup: removeMemberFromGroup,
    getGroupsWithMember: getGroupsWithMember,
};