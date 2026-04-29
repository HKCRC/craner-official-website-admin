#!/bin/sh
# Ensures replica set rs0 exists (Prisma + Mongo). Needed when /data/db was
# created without init scripts (e.g. partial data after disk-full) so
# docker-entrypoint-initdb.d never ran.
mongosh --quiet --eval '
function hasPrimary() {
  try {
    var s = rs.status();
    if (!s.ok) return false;
    for (var i = 0; s.members && i < s.members.length; i++) {
      if (s.members[i].stateStr === "PRIMARY") return true;
    }
  } catch (e) {}
  return false;
}
if (hasPrimary()) quit(0);
try {
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongo:27017" }] });
} catch (e) {}
if (hasPrimary()) quit(0);
quit(1);
'
