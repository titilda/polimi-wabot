groupChatCheck = async (message) =>
    message.getChat().then((chat) => {
        if (!chat.isGroup) message.reply("Questo comando è disponibile solo in chat di gruppo")
        return chat.isGroup
    })

function getGroups(nconf, showHidden = false) {
    let groups = [];
    for (let group in nconf.get('groups')) {
        if (nconf.get('groups')[group].visible || showHidden) {
            groups.push(group);
        };
    };
    return groups;
};

function getGroupMembers(nconf, group) {
    return nconf.get('groups')[group]["members"];
};

function getGroupsWithMember(nconf, member) {
    const groups = getGroups(nconf);
    const groupsWithMember = [];
    for (let group of groups) {
        if (getGroupMembers(nconf, group).includes(member)) {
            groupsWithMember.push(group);
        };
    };
    return groupsWithMember;
};

function addMemberToGroup(nconf, group, member, privileged = false) {
    if (!nconf.get('groups')[group]["joinable"] && !privileged) {
        return false;
    };
    nconf.get('groups')[group]["members"].push(member);
    nconf.save();
    return true;
};

function removeMemberFromGroup(nconf, group, member, privileged = false) {
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
    groupChatCheck: groupChatCheck,
    getGroups: getGroups,
    getGroupMembers: getGroupMembers,
    addMemberToGroup: addMemberToGroup,
    removeMemberFromGroup: removeMemberFromGroup,
    getGroupsWithMember: getGroupsWithMember,
};