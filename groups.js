var { nconf } = require('./config.js');

function getGroups() {
    return Object.keys(nconf.get('groups'));
}

function getGroupMembers(group) {
    return nconf.get('groups')[group];
}

function addMemberToGroup(group, member) {
    nconf.get('groups')[group].push(member);
    nconf.save();
}

function removeMemberFromGroup(group, member) {
    nconf.get('groups')[group] = nconf.get('groups')[group].filter(m => m !== member);
    nconf.save();
}

module.exports = {
    getGroups: getGroups,
    getGroupMembers: getGroupMembers,
    addMemberToGroup: addMemberToGroup,
    removeMemberFromGroup: removeMemberFromGroup
};