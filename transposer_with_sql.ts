"use strict";
import { MustExistInConnection, Attribute, Relation, Connection, Queue } from "./erClasses.ts"


const allowMultiConnections = true;
const allowRecursiveDistinctRelationBeta = true;

const theLazyWay = true;


function colorString(text: string, r: number, g: number, b: number): string {
    return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`
}

// yeah i have no clue why it throws me a weird importation error. ill fix later tho
const Cardinality = {
    ZERO_TO_ONE: "ZERO_TO_ONE",
    ONE_TO_ZERO: "ONE_TO_ZERO",
    ZERO_TO_ONE_NID: "ZERO_TO_ONE_NID",
    ONE_TO_ZERO_NID: "ONE_TO_ZERO_NID",

    MANY_ZERO_TO_ZERO: "MANY_ZERO_TO_ZERO",
    MANY_ONE_TO_ZERO: "MANY_ONE_TO_ZERO",
    MANY_ZERO_TO_ONE: "MANY_ZERO_TO_ONE",
    MANY_ONE_TO_ONE: "MANY_ONE_TO_ONE",

    MANY_ZERO_TO_ZERO_NID: "MANY_ZERO_TO_ZERO_NID",
    MANY_ONE_TO_ZERO_NID: "MANY_ONE_TO_ZERO_NID",
    MANY_ZERO_TO_ONE_NID: "MANY_ZERO_TO_ONE_NID",
    MANY_ONE_TO_ONE_NID: "MANY_ONE_TO_ONE_NID",

    ZERO_TO_MANY_ZERO: "ZERO_TO_MANY_ZERO",
    ZERO_TO_MANY_ONE: "ZERO_TO_MANY_ONE",
    ONE_TO_MANY_ZERO: "ONE_TO_MANY_ZERO",
    ONE_TO_MANY_ONE: "ONE_TO_MANY_ONE",

    ZERO_TO_MANY_ZERO_NID: "ZERO_TO_MANY_ZERO_NID",
    ZERO_TO_MANY_ONE_NID: "ZERO_TO_MANY_ONE_NID",
    ONE_TO_MANY_ZERO_NID: "ONE_TO_MANY_ZERO_NID",
    ONE_TO_MANY_ONE_NID: "ONE_TO_MANY_ONE_NID",

    // MANY_ZERO_TO_MANY_ZERO:true,
    // MANY_ONE_TO_MANY_ZERO:true,
    // MANY_ZERO_TO_MANY_ONE:true,
    // MANY_ONE_TO_MANY_ONE:true,
    MANY_TO_MANY: "MANY_TO_MANY",

    SUPER_TO_SUBTYPE: "SUPER_TO_SUBTYPE"
}

function setSubtypeRelationConnection(supertype: Relation, subtype: Relation, connectionType: string) {
    supertype.getPrimaryKeys().forEach(key => {
        let subTypeKeyAttribute = new Attribute(key.name, true, true)
        if (key.datatype) { // new code to handle datatypes
            let datatype = key.datatype
            if (datatype.includes("AUTO_INCREMENT")) {
                datatype = datatype.replace(" AUTO_INCREMENT", "")
            }
            console.log(`${key.name} in ${supertype.name} -> ${subtype.name}.`)
            subTypeKeyAttribute.setDatatype(datatype)
        } else {
            console.log(`${key.name} in ${supertype.name} has no datatype.`)
        }
        if (key.recursiveAttributeName) {
            subTypeKeyAttribute.setRecursiveName(key.recursiveAttributeName)
        }
        subtype.addAttribute(subTypeKeyAttribute) // transfers the PKS over and makes them FKS as well.
        subtype.addMustExistInConnection(supertype, key.name) // creates MEI connection
    })
    subtype.setInheritedFrom(supertype);
    subtype.setSubType(true)
}

function setOneToManyConnection(relation1: Relation, relation2: Relation, ignoreForeignKeys: boolean = false, isIdentifying: boolean = true, manyToMany: boolean = false, needsNotNull: boolean = false) {
    let recursive = false;
    if (relation1 === relation2) {
        recursive = true;
    }
    relation1.getPrimaryKeys().forEach(key => {
        if (ignoreForeignKeys) { // if ignoring foreign keys
            if (key.isForeignKey() && !relation1.isSubType()) { // needs to inherit PKS from a subtype.
                return
            }
        }
        let keyName = key.name
        let pkBoolean = false

        // 5/15/26 recursion thing and added the && check
        if (relation2.getAttribute(keyName) && !recursive) {
            if (allowRecursiveDistinctRelationBeta) {
                // 5/17/26 added this check here due to weird subtyping stuff
                if (!relation1.getAttribute(keyName)) {
                    keyName = keyName + "_" + relation1.name.toLowerCase()
                }
            } else {
                throw new Error("Error. Major error happened, or Recursive Relationships with Distinct Relations is not enabled.")
            }
        }

        if (recursive) {
            // 5/14/26 new addition for custom recursive attribute names
            if (key.recursiveAttributeName) {
                keyName = key.recursiveAttributeName
            } else {
                keyName = relation1.name.toLowerCase() + "_" + keyName
            }
            pkBoolean = false
        }
        if (!isIdentifying) {
            pkBoolean = false
        }

        if (relation1.isSubType() && !recursive) { // NEW ADDITION FOR SUBTYPE STUFF
            keyName = relation1.name.toLowerCase() + "_" + keyName
            // 5/16/25 i commented this pk boolean thing out because it was breaking MtM connections w/ subtypes
            // 5/16/25 LATER: revert
            pkBoolean = false
            // 5/16/25 associative entity check???
            if (!relation2.isSubType() && relation2.weak && relation2.isAssociativeEntity) {
                pkBoolean = true
            }
        }


        // 5/16/25 moved MtM check here due to issues with conflicting items above
        if (manyToMany) {
            pkBoolean = true
        }


        // 5/14/26 new code to handle multi-connections A |--{ B, A |--{ B
        let duplicate_pk_connections = 0
        relation2.mustExistIn.forEach(connection => {
            if (connection.mainPKNameRecursive === key.name) {
                duplicate_pk_connections++;
            }
        });

        if (duplicate_pk_connections > 0) {
            if (allowMultiConnections) {
                keyName += "_" + (duplicate_pk_connections + 1)
            } else { // 5/15/26 new code to handle multi-connections 
                throw new Error("Multi connection is not enabled. Enable the constant allowMultiConnections at the top of this file.")
            }
        }

        if (relation2.weak === true && !relation1.isSubType()) { // new code to handle set weak entities || 5/16/25 edited so that subtype relationships cannot make PKS.
            // console.log(colorString(`triggered by ${relation1.name} -> ${relation2.name}`,255,0,0))
            pkBoolean = true
        }

        let foreignKey = new Attribute(keyName, pkBoolean, true) // forced (TRUE) for now

        if (key.datatype) { // new code to handle datatypes
            let datatype = key.datatype
            if (datatype.includes("AUTO_INCREMENT")) {
                datatype = datatype.replace(" AUTO_INCREMENT", "")
            }
            console.log(`${key.name} in ${relation1.name} -> ${relation2.name}.`)
            foreignKey.setDatatype(datatype)
        } else {
            console.log(`${key.name} in ${relation1.name} has no datatype.`)
        }

        if (needsNotNull) { // new code to handle NOT NULL FK
            console.log(relation1.name + " -> " + relation2.name + ": putting not null")
            foreignKey.setForeignKeyNotNull(true)
        }

        relation2.addAttribute(foreignKey)
        relation2.addMustExistInConnection(relation1, keyName, key.name) // creates MEI connection
    })
}


function setManyToManyConnection(relation1: Relation, relation2: Relation, extraAttributes: Attribute[]): Relation {
    let newRelation = new Relation(relation1.name + "_" + relation2.name, [])
    setOneToManyConnection(relation1, newRelation, true, true, true)
    setOneToManyConnection(relation2, newRelation, true, true, true)
    return newRelation
}


function buildRelations(relations: any): Map<String, Relation> {
    let rls = new Map<String, Relation>()
    for (let i in relations) {
        let newRelation = new Relation(i, [])
        let attributes = relations[i]["attributes"]
        // let recursiveAttributes = relations[i]["recursive"]
        // 5/16/26 amt of PKS for associative entity tracking
        let primaryKeys = 0
        for (let a in attributes) {
            let identifierBoolean = attributes[a]
            if (identifierBoolean == true) {
                primaryKeys++;
            }
            let newAttribute = new Attribute(a, identifierBoolean, false)
            if (relations[i]["datatypes"]) { // new code to handle explicit data types
                if (relations[i]["datatypes"][a]) {
                    newAttribute.setDatatype(relations[i]["datatypes"][a])
                }
            }
            newRelation.addAttribute(newAttribute)
        }

        if (relations[i]["recursive"]) {
            let recursiveAttributes = relations[i]["recursive"]
            for (let rA in recursiveAttributes) {
                if (newRelation.getAttribute(rA)) {
                    // this sets the relation custom name
                    newRelation.getAttribute(rA)?.setRecursiveName(recursiveAttributes[rA])
                } else {
                    throw new Error(`${rA} is not mapped to a valid attribute in the relation`)
                }
            }
        }

        if (relations[i]["weak"]) {
            newRelation.weak = true;
            if (primaryKeys == 0) {
                console.log(colorString(`${newRelation.name} is an ASSOCIATIVE entity`, 0, 0, 255))
                newRelation.isAssociativeEntity = true
            }
        }
        rls.set(i, newRelation)
    }
    return rls
}

function buildConnections(connections: any, relations: Map<String, Relation>): Connection[] {
    let cctns: Connection[] = []
    for (let i in connections) {
        let c = connections[i]
        let newConnection = new Connection(
            c[0], // r1
            c[1], // r2
            c[2], // conn_type
            relations,
        )

        cctns.push(newConnection)
    }
    return cctns;
}


// figure out a better way to do this (hashmap?)
const relationshipConnectionsTable: any = {
    // ----------------------1:1--------------------------
    "ONE_TO_ZERO": { flipped: false, ignFK: false, isID: true, MtM: false, nNN: true },
    "ZERO_TO_ONE": { flipped: true, ignFK: false, isID: true, MtM: false, nNN: true },
    "ONE_TO_ZERO_NID": { flipped: false, ignFK: false, isID: false, MtM: false, nNN: true },
    "ZERO_TO_ONE_NID": { flipped: true, ignFK: false, isID: false, MtM: false, nNN: true },
    // ----------------------1:M-------------------------
    "ZERO_TO_MANY_ZERO": { flipped: false, ignFK: false, isID: true, MtM: false, nNN: false },
    "ZERO_TO_MANY_ONE": { flipped: false, ignFK: false, isID: true, MtM: false, nNN: false },
    "ONE_TO_MANY_ZERO": { flipped: false, ignFK: false, isID: true, MtM: false, nNN: true },
    "ONE_TO_MANY_ONE": { flipped: false, ignFK: false, isID: true, MtM: false, nNN: true },
    "ZERO_TO_MANY_ZERO_NID": { flipped: false, ignFK: false, isID: false, MtM: false, nNN: false },
    "ZERO_TO_MANY_ONE_NID": { flipped: false, ignFK: false, isID: false, MtM: false, nNN: false },
    "ONE_TO_MANY_ZERO_NID": { flipped: false, ignFK: false, isID: false, MtM: false, nNN: true },
    "ONE_TO_MANY_ONE_NID": { flipped: false, ignFK: false, isID: false, MtM: false, nNN: true },

    // ----------------------M:1-------------------------
    "MANY_ZERO_TO_ZERO": { flipped: true, ignFK: false, isID: true, MtM: false, nNN: false },
    "MANY_ONE_TO_ZERO": { flipped: true, ignFK: false, isID: true, MtM: false, nNN: false },
    "MANY_ZERO_TO_ONE": { flipped: true, ignFK: false, isID: true, MtM: false, nNN: true },
    "MANY_ONE_TO_ONE": { flipped: true, ignFK: false, isID: true, MtM: false, nNN: true },
    "MANY_ZERO_TO_ZERO_NID": { flipped: true, ignFK: false, isID: false, MtM: false, nNN: false },
    "MANY_ONE_TO_ZERO_NID": { flipped: true, ignFK: false, isID: false, MtM: false, nNN: false },
    "MANY_ZERO_TO_ONE_NID": { flipped: true, ignFK: false, isID: false, MtM: false, nNN: true },
    "MANY_ONE_TO_ONE_NID": { flipped: true, ignFK: false, isID: false, MtM: false, nNN: true },




}
function setConnection(relation1: Relation, relation2: Relation, connectionType: string) {
    if (connectionType === Cardinality.SUPER_TO_SUBTYPE) {
        setSubtypeRelationConnection(relation1, relation2, "placeholder")
    } else if (relationshipConnectionsTable[connectionType] !== null) {
        const conn = relationshipConnectionsTable[connectionType]
        if (conn.flipped) {
            [relation1, relation2] = [relation2, relation1]
        }
        setOneToManyConnection(
            relation1,
            relation2,
            conn.ignFK,
            conn.isID,
            conn.MtM,
            conn.nNN
        )
    } else {
        throw new Error("this connection type does not exist")
    }
}

function transpose(rls: Object, cctns: string[][] | any[]) {
    let relations = buildRelations(rls)
    let connections = buildConnections(cctns, relations)

    // theLazyWay is a VERY SLOW algorithm I made so no matter the order of connections insert, it will always transpose correctly
    // might refactor later if its genuinely too slow
    if (theLazyWay) {
        console.log("doing it the lazy way (SLOWER)")

        const relMapByHits = new Map<Relation, number>()
        const connectionIndex = new Map<Relation, Connection[]>()
        const MtMConnections: Connection[] = []
        relations.forEach((relation) => {
            relMapByHits.set(relation, 0)
            connections.forEach((c) => {
                // console.log(c.relation1?.name,c.relation2?.name)
                if (c.connectionType in relationshipConnectionsTable || c.connectionType == Cardinality.SUPER_TO_SUBTYPE) {
                    let r1 = c.getRelation1()
                    let r2 = c.getRelation2()
                    let rlConnTypeData = relationshipConnectionsTable[c.connectionType]
                    if (rlConnTypeData && rlConnTypeData.flipped) {
                        [r1, r2] = [r2, r1]
                    }
                    if (relation === r2) {
                        // console.log("HIT")
                        let newNum = relMapByHits.get(relation) || 0 // should NEVER trigger 0 but ok bruh.
                        // check for recursion
                        if (r1 !== r2) {
                            relMapByHits.set(relation, newNum + 1)
                        }
                        if (!connectionIndex.has(relation)) {
                            connectionIndex.set(relation, [])
                        }

                        connectionIndex.get(relation)?.push(c)
                    }
                }
            })
        })

        // console.log(connectionIndex)

        connections.forEach((c) => {
            if (c.connectionType === Cardinality.MANY_TO_MANY) {
                MtMConnections.push(c)
            }
        })


        // console.log(relMapByHits)
        let maxConnections = 0
        const relMapByHitsFlipped = new Map<number, Set<Relation>>()
        relMapByHits.forEach((v, k) => {
            if (!relMapByHitsFlipped.has(v)) {
                relMapByHitsFlipped.set(v, new Set<Relation>())
            }
            relMapByHitsFlipped.get(v)?.add(k)
            if (v > maxConnections) {
                maxConnections = v
            }
        })

        // create new connections + map for relations in order
        relations = new Map<string, Relation>()
        connections = []

        // this is when an element is prematurely connected to an element on a whole different layer (usually below)
        let layerQueues = new Map<number, Queue<Connection>>()
        const superQueueRelations = new Map<number, Set<Relation>>()

        for (let i = 0; i <= maxConnections; i++) {
            if (relMapByHitsFlipped.has(i)) {
                console.log(i)
                let relationLayerSet = relMapByHitsFlipped.get(i)
                let thisLayerFinishedConnections = new Set<Relation>()
                let thisLayerQueue = new Queue<Connection>()
                relationLayerSet?.forEach((relationObject) => {
                    console.log(colorString(relationObject.name + "", 255, 125, 255))
                    if (i == 0) {
                        relations.set(relationObject.name, relationObject)
                    }

                    let connectionLayerSet = connectionIndex.get(relationObject)
                    // used to gauge if it relations should be placed in the hashmap before or after the queue dumps
                    const expectedAmountOfConnections = connectionLayerSet?.length
                    let amountOfConnectionsInitialized = 0
                    
                    connectionLayerSet?.forEach((conn) => {
                        console.log(`${conn.getRelation1().name} -> ${conn.getRelation2().name}`)
                        if (relationLayerSet.has(conn.getRelation1()) && !thisLayerFinishedConnections.has(conn.getRelation1())) {
                            console.log("placing " + relationObject.name + " in queue due to premature connection!")
                            thisLayerQueue.enqueue(conn)
                        } else {
                            // 5/17/26 new check for if rel1 is on a deeper level then move it to that queue
                            let relation1 = conn.getRelation1()
                            let hitsOfRelation1 = relMapByHits.get(relation1)
                            let hitsOfMyRelation = relMapByHits.get(relationObject)

                            if (hitsOfRelation1 && hitsOfMyRelation && hitsOfRelation1 > hitsOfMyRelation) {
                                console.log("changing priority of " + relationObject.name + " to (layer " + hitsOfRelation1 + ") (1) due to premature connection!")
                                // 5/19/26 set the new hit meter, and instead of setting a layerqueue just add the relation to the next layer
                                // if (!layerQueues.has(hitsOfRelation1)) {
                                //     layerQueues.set(hitsOfRelation1, new Queue<Connection>())
                                // }
                                // layerQueues.get(hitsOfRelation1)?.enqueue(conn)
                                relMapByHits.set(relationObject, hitsOfRelation1)
                                relMapByHitsFlipped.get(hitsOfRelation1)?.add(relationObject)
                            } else {
                                // console.log(superQueueRelations.get(i))
                                if (superQueueRelations.get(i)?.has(relation1)) {
                                    // console.log('beuhhh')
                                    console.log("placing " + relationObject.name + " in the super queue (layer " + hitsOfRelation1 + ") (3) due to premature connection!")

                                    if (hitsOfRelation1 && hitsOfMyRelation) {
                                        if (!layerQueues.has(hitsOfRelation1)) {
                                            layerQueues.set(hitsOfRelation1, new Queue<Connection>())
                                        }
                                        layerQueues.get(hitsOfRelation1)?.enqueue(conn)
                                    }
                                } else {
                                    connections.push(conn)
                                    // console.log("ADDING " + relationObject.name)
                                    thisLayerFinishedConnections.add(relationObject)
                                    amountOfConnectionsInitialized++
                                }

                            }

                        }
                    })
                    if (thisLayerFinishedConnections.has(relationObject) && amountOfConnectionsInitialized == expectedAmountOfConnections) {
                        relations.set(relationObject.name, relationObject)
                    }
                })


                while (!thisLayerQueue.isEmpty()) {
                    let connectionObject = thisLayerQueue.dequeue()
                    // 5/19/26 new check for items branching off a premature item in a different layer that has not yet been initialized
                    const relation1 = connectionObject.getRelation1()
                    const relation2 = connectionObject.getRelation2()
                    if (!thisLayerFinishedConnections.has(relation1)) {
                        let hitsOfRelation1 = relMapByHits.get(relation1)
                        console.log("placing " + relation2.name + " in the super queue (layer " + hitsOfRelation1 + ") (2) due to premature connection!")
                        if (hitsOfRelation1) {
                            if (!layerQueues.has(hitsOfRelation1)) {
                                layerQueues.set(hitsOfRelation1, new Queue<Connection>())
                            }
                            layerQueues.get(hitsOfRelation1)?.enqueue(connectionObject)
                            relMapByHits.set(relation2, hitsOfRelation1)

                            // 5/19/26 superqueue relations
                            if (!superQueueRelations.has(hitsOfRelation1)) {
                                superQueueRelations.set(hitsOfRelation1, new Set<Relation>())
                            }
                            superQueueRelations.get(hitsOfRelation1)?.add(relation2)
                        }
                    } else {
                        connections.push(connectionObject)
                        relations.set(relation2.name, relation2)
                    }

                }

                // 5/17/26 new check for other queues
                if (layerQueues.has(i)) {
                    const layerQueue = layerQueues.get(i)
                    while (!layerQueue?.isEmpty()) {
                        let connectionObject = layerQueue?.dequeue()
                        // console.log(connectionObject)
                        // @ts-ignore
                        connections.push(connectionObject)
                        // @ts-ignore
                        relations.set(connectionObject.getRelation2().name, connectionObject.getRelation2())
                    }
                }


            }
        }

        for (let remainingConnection of MtMConnections) {
            // console.log(remainingConnection)
            connections.push(remainingConnection)
        }
    }



    connections.forEach(c => {
        if (c.connectionType == "MANY_TO_MANY") {
            let newRelation = setManyToManyConnection(c.getRelation1(), c.getRelation2(), [])
            relations.set(newRelation.name, newRelation)
        } else {
            setConnection(c.getRelation1(), c.getRelation2(), c.connectionType)
        }
    })
    console.log("-----------------------------------------------------------------------------------")
    relations.forEach(r => {
        console.log(r.toString())
    })
    return relations;
}



function relation_to_sql() {
    let relations = transpose(Relations, Connections);
    console.log("-----------------------------------------------------------------------------------")
    // relations.forEach(r => {
    //     console.log(`DROP TABLE IF EXISTS ${r.name.toLowerCase()};`)
    // })
    relations.forEach(r => {
        let createStatement = `${colorString("CREATE TABLE", 0, 155, 255)} ${colorString(r.name.toLowerCase(), 255, 255, 255)} (`
        let stringArray: string[] = []
        let displayedFKComment = false
        r.getAttributes().forEach(a => {
            let defaultString = `\n    ${a.name} `
            if (a.datatype) {
                defaultString += colorString(a.datatype, 100, 241, 153)
            } else {
                defaultString += "___________"
            }
            if (a.isForeignKey() && !displayedFKComment) {
                stringArray.push(`\n\n    ${colorString("# ----[ FOREIGN KEYS ]----", 188, 20, 34)}`)
                displayedFKComment = true;
            }
            if (a.isForeignKey() && !a.isIdentifier() && a.foriegnKeyNotNULL == true) { // if FK and NOT PK and if it is signified from a 1 on the ER diagram, Not Null is required.
                defaultString += colorString(" NOT NULL", 255, 40, 40)
            }

            stringArray.push(defaultString)
        })
        stringArray.push(`\n\n    ${colorString("# ----[ CONSTRAINTS ]----", 188, 20, 34)}`)
        let pks: string[] = [] // primary key names

        r.getAttributes().forEach(a => {
            if (a.isIdentifier()) {
                pks.push(a.name)
            }
        })


        if (pks.length > 0) {
            let defaultString = `\n    ${colorString("CONSTRAINT", 0, 155, 255)} ${r.name.toLowerCase()}_pk ${colorString("PRIMARY KEY", 187, 0, 255)} (${pks.join(", ")})`
            stringArray.push(defaultString)
        }

        let meiMap = new Map<String, Map<String, String>[]>()

        r.mustExistIn.forEach(m => {
            let attributeName = m.attributeName
            let referenceName = m.attributeName
            if (m.mainPKNameRecursive !== "null") {
                referenceName = m.mainPKNameRecursive
            }
            let relationName = m.relationConnection.name
            if (!meiMap.has(relationName)) {
                meiMap.set(relationName, [])
            }
            let referenceObject = new Map()
            referenceObject.set("attributeName", attributeName)
            referenceObject.set("referenceName", referenceName)
            meiMap.get(relationName)?.push(referenceObject)
        })

        meiMap.forEach((params, attribute) => {
            let attributeNames = []
            let referenceNames = []
            for (let reference of params) {
                attributeNames.push(reference.get("attributeName"))
                referenceNames.push(reference.get("referenceName"))
            }
            let defaultString = `\n    ${colorString("CONSTRAINT", 0, 155, 255)} ${r.name.toLowerCase()}_${attribute.toLocaleLowerCase()}_fk ${colorString("FOREIGN KEY", 210, 210, 23)} (${attributeNames.join(", ")}) ${colorString("REFERENCES", 210, 210, 23)} ${attribute.toLocaleLowerCase()} (${referenceNames.join(", ")})`
            defaultString += `\n        ${colorString("ON UPDATE CASCADE", 255, 255, 255)}`
            defaultString += `\n        ${colorString("ON DELETE CASCADE", 255, 255, 255)}`
            stringArray.push(defaultString)
        })
        createStatement += stringArray.join(",")
        createStatement += "\n);"
        console.log(createStatement)
    })
}

const Relations: {} = {
    "&": {
        attributes: {
            id: true,
        },
    },
    A: {
        attributes: {
            a: true,
            b: false
        },
        datatypes: {
            a: "INT UNSIGNED AUTO_INCREMENT",
            b: "VARCHAR(50)"
        }
    },

    miniA: {
        attributes: {
            m: false
        }
    },

    B: {
        attributes: {
            // c: true,
            d: false
        },
        datatypes: {
            // c: "INT UNSIGNED AUTO_INCREMENT",
            d: "ENUM ('type1','type2')",
        },
        weak: true,
    },

    D: {
        attributes: {
            f: true,
            g: true
        },
        datatypes: {
            f: "INT UNSIGNED AUTO_INCREMENT",
            g: "VARCHAR(50)"
        }
    },
    C: {
        attributes: {
            e: false
            // d: false
        },
        weak: true
    },

    E: {
        attributes: {

        },
        weak: true
    },
    F: {
        attributes: {
            bruh: false
        }
    },
    G: {
        attributes: {
            zuh: false
        }
    },
    H: {
        attributes: {
            zuh: false
        }
    }
}

const Connections: any[] = [
    ["A", "B", Cardinality.ONE_TO_ZERO],
    ["B", "C", Cardinality.ONE_TO_MANY_ONE],
    ["D", "C", Cardinality.ONE_TO_MANY_ONE],
    ["A", "miniA", Cardinality.SUPER_TO_SUBTYPE],
    ["C", "E", Cardinality.ONE_TO_MANY_ONE],
    ["E", "F", Cardinality.SUPER_TO_SUBTYPE],
    ["&", "G", Cardinality.ONE_TO_MANY_ZERO],
    ["&", "H", Cardinality.ONE_TO_MANY_ZERO],
    ["F", "G", Cardinality.ONE_TO_MANY_ZERO],
    ["F", "H", Cardinality.ONE_TO_MANY_ZERO],
]

// relation_to_sql();
transpose(Relations, Connections)