"use strict";
function ArrayToString(array: string[]): string {
    let finalString = ""
    let sep = ", "
    let iteration = 0
    array.forEach(element => {
        finalString += element;
        if (iteration < array.length - 1) {
            finalString += sep
        }
        iteration++;
    })
    return finalString;
}

class MustExistInConnection {
    public relationConnection;
    public attributeName;
    public mainPKNameRecursive: string = "null";
    constructor(relation: Relation, attributeName: string) {
        this.relationConnection = relation;
        this.attributeName = attributeName;
    }
    setRecursive(attribute_string: string) {
        this.mainPKNameRecursive = attribute_string;
    }
}

class Attribute {
    public name;
    public identifier;
    public foreignKey;
    // mustExistIn;
    constructor(name: string, identifierBoolean: boolean, foreignKeyBoolean: boolean) {
        this.name = name
        this.identifier = identifierBoolean
        this.foreignKey = foreignKeyBoolean
    }
    isIdentifier() {
        return this.identifier;
    }
    isForeignKey() {
        return this.foreignKey;
    }
    setIdentifier(boolean: boolean) {
        this.identifier = boolean
    }
    setForeignKey(boolean: boolean) {
        this.foreignKey = boolean
    }
    // setMustExistIn(attribute_name) {
    //     this.mustExistIn = attribute_name
    // }
    toString() {
        let id = ""
        if (this.isIdentifier() || this.isForeignKey()) {
            let b = []
            if (this.isIdentifier()) { b.push("PK") }
            if (this.isForeignKey()) { b.push("FK") }
            id = " <<" + ArrayToString(b) + ">>"
        }

        return `${this.name}` + id
    }

}

class Relation {
    public name;
    private attributes = new Map<string, Attribute>();
    public mustExistIn: MustExistInConnection[] = []

    private subTypeData = {
        "isSubType": false,
        "inheritedFrom": new Object
    }

    public weak: boolean;

    constructor(name: String, attributesIterable: Attribute[]) {
        this.name = name;
        attributesIterable.forEach(element => {
            this.attributes.set(element.name, element)
        });
        this.weak = false;
    }
    addMustExistInConnection(relationObject: Relation, identifierName: string, recursiveKey: string = "null") {
        let mei = new MustExistInConnection(relationObject, identifierName)
        if (recursiveKey !== "null") {
            mei.setRecursive(recursiveKey)
        }
        this.mustExistIn.push(mei)
    }

    setSubType(boolean: boolean) {
        this.subTypeData.isSubType = boolean;
    }

    setInheritedFrom(relation: Relation) {
        this.subTypeData.inheritedFrom = relation;
    }

    isSubType() {
        return this.subTypeData.isSubType
    }
    getInheritedFrom() {
        return this.subTypeData.inheritedFrom
    }

    getAttributes() {
        return this.attributes
    }
    getAttribute(attribute_name: string) {
        let foundAttribute = null
        foundAttribute = this.attributes.get(attribute_name);
        return foundAttribute;

    }

    getPrimaryKeys() {
        let primaryKeys = new Map<string, Attribute>()
        this.attributes.forEach(attribute => {
            if (attribute.isIdentifier()) {
                primaryKeys.set(attribute.name, attribute)
            }
        })
        return primaryKeys
    }
    addAttribute(attribute: Attribute) { // attributeObject
        this.attributes.set(attribute.name, attribute)
    }
    removeAttribute(attribute_name: string) {
        let attributeObject = this.getAttribute(attribute_name)
        if (attributeObject) {
            let deleted = this.attributes.delete(attribute_name)
            if (!deleted) {
                throw new Error("Attempted to remove but was not found.")
            }
            return attributeObject;
        }
    }

    toString() {
        let arr: string[] = []
        this.attributes.forEach(element => {
            arr.push(element.toString())
        })
        let mei = ""
        if (this.mustExistIn.length > 0) {
            mei += "\n\t"
            for (let _ in this.mustExistIn) {
                let i = parseInt(_)
                let connection = this.mustExistIn[i]
                // console.log(connection)
                let attributeName = connection.attributeName
                if (connection.mainPKNameRecursive !== "null") {
                    attributeName = connection.mainPKNameRecursive
                }
                mei += `${this.name}(${connection.attributeName}) mei ${connection.relationConnection.name}(${attributeName})`
                if (i < this.mustExistIn.length - 1) {
                    mei += "\n\t"
                }
            }
        }
        return this.name + "(" + ArrayToString(arr) + ")" + mei
    }

}

class Connection {
    public relation1?: Relation
    public relation2?: Relation
    public connectionType: string
    constructor(relation1: string, relation2: string, connectionType: string, relations: Map<String, Relation>) {
        if (relations.get(relation1)) {
            let r1 = relations.get(relation1)
            this.relation1 = r1
        } else {
            throw new Error("There is no relation named " + relation1)
        }

        if (relations.get(relation2)) {
            let r2 = relations.get(relation2)
            this.relation2 = r2
        } else {
            throw new Error("There is no relation named " + relation2)
        }

        this.connectionType = connectionType
    }
    getRelation1() {
        return this.relation1 || new Relation("____NULL", [])
    }
    getRelation2() {
        return this.relation2 || new Relation("____NULL", [])
    }
}


const Cardinality = {
    ZERO_TO_ONE: "ZERO_TO_ONE",
    ONE_TO_ZERO: "ONE_TO_ZERO",
    ZERO_TO_ONE_NON_IDENTIFYING: "ZERO_TO_ONE_NON_IDENTIFYING",
    ONE_TO_ZERO_NON_IDENTIFYING: "ONE_TO_ZERO_NON_IDENTIFYING",
    // ----------------------------------
    ONE_TO_ONE: "ONE_TO_ONE",
    // ----------------------------------
    MANY_TO_ONE: "MANY_TO_ONE",
    ONE_TO_MANY: "ONE_TO_MANY",
    MANY_TO_ONE_NON_IDENTIFYING: "MANY_TO_ONE_NON_IDENTIFYING",
    ONE_TO_MANY_NON_IDENTIFYING: "ONE_TO_MANY_NON_IDENTIFYING",
    // ----------------------------------
    MANY_TO_MANY: "MANY_TO_MANY",
    // ----------------------------------
    SUPER_TO_SUBTYPE: "SUPER_TO_SUBTYPE"
}

function setSubtypeRelationConnection(supertype: Relation, subtype: Relation, connectionType: string) {
    supertype.getPrimaryKeys().forEach(key => {
        let subTypeKeyAttribute = new Attribute(key.name, true, true)
        subtype.addAttribute(subTypeKeyAttribute) // transfers the PKS over and makes them FKS as well.
        subtype.addMustExistInConnection(supertype, key.name) // creates MEI connection
    })
    subtype.setInheritedFrom(supertype);
    subtype.setSubType(true)
}

function setOneToManyConnection(relation1: Relation, relation2: Relation, ignoreForeignKeys: boolean = false, isIdentifying: boolean = true, manyToMany: boolean = false) {
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
        if (manyToMany) {
            // console.log("MANY TO MANY CONNECIGON INIT")
            pkBoolean = true
        }
        if (recursive) {
            keyName = relation1.name.toLowerCase() + "_" + keyName
            pkBoolean = false
        }
        if (!isIdentifying) {
            pkBoolean = false
        }

        if (relation1.isSubType() && !recursive) { // NEW ADDITION FOR SUBTYPE STUFF
            keyName = relation1.name.toLowerCase() + "_" + keyName
            pkBoolean = false
            if (!relation2.isSubType()) {
                pkBoolean = true
            }
        }

        if (relation2.weak === true) { // new code to handle set weak entities
            pkBoolean = true
        }

        let foreignKey = new Attribute(keyName, pkBoolean, true) // forced false for now
        relation2.addAttribute(foreignKey)
        relation2.addMustExistInConnection(relation1, keyName, key.name) // creates MEI connection
    })
}


function setManyToManyConnection(relation1: Relation, relation2: Relation, extraAttributes: Attribute[]): Relation {
    let newRelation = new Relation(relation1.name + "_" + relation2.name, [])
    setOneToManyConnection(relation1, newRelation,true,true,true)
    setOneToManyConnection(relation2, newRelation,true,true,true)
    return newRelation
}


function buildRelations(relations: any): Map<String, Relation> {
    let rls = new Map<String, Relation>()
    for (let i in relations) {
        // console.log(relations[i])
        let newRelation = new Relation(i, [])
        let attributes = relations[i]["attributes"]
        // console.log(attributes)
        for (let a in attributes) {
            let identifierBoolean = attributes[a]
            let newAttribute = new Attribute(a, identifierBoolean, false)
            newRelation.addAttribute(newAttribute)
        }
        if (relations[i]["weak"]) {
            newRelation.weak = true;
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


function setConnection(relation1: Relation, relation2: Relation, connectionType: string) {
    // console.log("CONNECTION TYPE:"+connectionType)
    if (connectionType === Cardinality.SUPER_TO_SUBTYPE) {
        setSubtypeRelationConnection(relation1, relation2, "placeholder")
    }
    if (connectionType === Cardinality.ONE_TO_MANY) {
        setOneToManyConnection(relation1, relation2)
    }
    if (connectionType === Cardinality.ONE_TO_MANY_NON_IDENTIFYING) {
        setOneToManyConnection(relation1, relation2, false, false)
    }
    if (connectionType === Cardinality.MANY_TO_ONE) {
        setOneToManyConnection(relation2, relation1)
    }
    if (connectionType === Cardinality.MANY_TO_ONE_NON_IDENTIFYING) {
        setOneToManyConnection(relation2, relation1, false, false)
    }
    if (connectionType === Cardinality.ONE_TO_ZERO) {
        setOneToManyConnection(relation1, relation2)
    }
    if (connectionType === Cardinality.ONE_TO_ZERO_NON_IDENTIFYING) {
        setOneToManyConnection(relation1, relation2, false, false)
    }
    if (connectionType === Cardinality.ZERO_TO_ONE) {
        setOneToManyConnection(relation2, relation1)
    }
    if (connectionType === Cardinality.ZERO_TO_ONE_NON_IDENTIFYING) {
        setOneToManyConnection(relation2, relation1, false, false)
    }
}

function transpose(rls: Object, cctns: string[][] | any[]) {
    let relations = buildRelations(rls)
    let connections = buildConnections(cctns, relations)
    connections.forEach(c => {
        if (c.connectionType == "MANY_TO_MANY") {
            let newRelation = setManyToManyConnection(c.getRelation1(), c.getRelation2(), [])
            relations.set(newRelation.name, newRelation)
        } else {
            setConnection(c.getRelation1(), c.getRelation2(), c.connectionType)
        }
    })
    relations.forEach(r => {
        console.log(r.toString())
    })
}

// const Relations: {} = {
//     "R1": {
//         attributes: {
//             A: true,
//             B: true,
//             C: false,
//             D: false
//         }
//     },
//     "R1_SUB": {
//         attributes: {
//             HAR_DE_HAR: false
//         }
//     },
//     "R2": {
//         attributes: {
//             E: true,
//             F: false,
//             G: false,
//             H: false
//         }
//     }
// }
// const Connections = [
//     ["R1","R2",Cardinality.ONE_TO_MANY,{}],
//     ["R1","R1_SUB",Cardinality.SUPER_TO_SUBTYPE,{}]

// ]

// const Relations: {} = {
//     "CITY": {
//         attributes: {
//             city_id: true,
//             name: false,
//             district: false,
//             population: false,
//         }
//     },
//     "CONTINENT": {
//         attributes: {
//             continent_id: true,
//             name: false,
//         }
//     },
//     "COUNTRY": {
//         attributes: {
//             code: true,
//             name: false,
//             region: false,
//             surface_area: false
//         }
//     },
//     "LANGUAGE": {
//         attributes: {
//             lang_code: true,
//             language: false,
//         }
//     }
// }
// const Connections = [
//     ["CITY", "COUNTRY", Cardinality.MANY_TO_ONE, {}],
//     ["CONTINENT", "COUNTRY", Cardinality.ONE_TO_MANY, {}],
//     ["LANGUAGE", "COUNTRY", Cardinality.MANY_TO_MANY, {}],
// ]

// const Relations: {} = {
//     "PERSON": {
//         attributes: {
//             ssn:true,
//             first_name:false,
//             last_name:false,
//         }
//     },
//     "STAFF": {
//         attributes: {

//         }
//     },
//     "PATIENT": {
//         attributes: {

//         }
//     },
//     "DEPARTMENT": {
//         attributes: {
//             department_number:true,
//             name:false
//         }
//     },
//     "SUPPORT_STAFF": {
//         attributes: {
//             wage:false
//         }
//     },
//     "NURSE": {
//         attributes: {
//             certification:false,
//         }
//     },
//     "DOCTOR": {
//         attributes: {

//         }
//     },
//     "INSURANCE_POLICY": {
//         attributes: {
//             policy_number:false
//         }
//     },
//     "INSURANCE_COMPANY": {
//         attributes: {
//             co_number: true,
//             name: false
//         }
//     },
// }

// const Connections = [
//     ["PERSON","STAFF",Cardinality.SUPER_TO_SUBTYPE,{}],
//     ["PERSON","PATIENT",Cardinality.SUPER_TO_SUBTYPE,{}],
//     ["STAFF","SUPPORT_STAFF",Cardinality.SUPER_TO_SUBTYPE,{}],
//     ["STAFF","NURSE",Cardinality.SUPER_TO_SUBTYPE,{}],
//     ["STAFF","DEPARTMENT",Cardinality.MANY_TO_MANY,{}],
//     ["STAFF","STAFF",Cardinality.ONE_TO_MANY,{}], // this breaks PK names for some reason: UPDATE -> NVM
//     ["STAFF","DOCTOR",Cardinality.SUPER_TO_SUBTYPE],
//     ["DOCTOR","PATIENT",Cardinality.ONE_TO_MANY,{}],
//     ["DOCTOR","DOCTOR",Cardinality.ONE_TO_MANY,{}], // this breaks PK names for some reason: UPDATE -> NVM
//     ["PATIENT","INSURANCE_POLICY",Cardinality.ONE_TO_MANY,{}],
//     ["INSURANCE_COMPANY","INSURANCE_POLICY",Cardinality.ONE_TO_MANY,{}],
// ]
// const Relations: {} = {
//     "Member": {
//         attributes: {
//             member_id:true,
//             name:false,
//             address:false
//         }
//     },
//     "Musician": {
//         attributes: {
//             instrument:false,
//         }
//     },
//     "Soloist": {
//         attributes: {

//         }
//     },
//     "Conductor": {
//         attributes: {
//         }
//     },
//     "Junior": {
//         attributes: {

//         }
//     },
//     "Senior": {
//         attributes: {

//         }
//     },
//     "ConcertSeason": {
//         attributes: {
//             season_year:true,
//             opening_date:false,
//             closing_date:false,
//         }
//     },
//     "Concert": {
//         attributes: {
//             concert_number:true,
//             name:false,
//             date:false,
//             time:false,
//         },
//         weak:true
//     },
//     "Composition": {
//         attributes: {
//             composer_name:true,
//             composition_name:true,
//             num_movements:false,
//         }
//     },
//     "CompositionSoloist": {
//         attributes: {
//             date_last_solo:false,
//         }
//     },
// }

// const Connections = [
//     ["Member","Musician",Cardinality.SUPER_TO_SUBTYPE],
//     ["Member","Conductor",Cardinality.SUPER_TO_SUBTYPE],
//     ["Conductor","Junior",Cardinality.SUPER_TO_SUBTYPE],
//     ["Conductor","Senior",Cardinality.SUPER_TO_SUBTYPE],
//     ["Junior","Senior",Cardinality.ZERO_TO_ONE],
//     ["Musician","Soloist",Cardinality.SUPER_TO_SUBTYPE],
//     ["ConcertSeason","Concert",Cardinality.ONE_TO_MANY],
//     ["Conductor","Concert",Cardinality.ONE_TO_MANY],
//     ["Composition","CompositionSoloist",Cardinality.ONE_TO_MANY],
//     ["Composition","Concert",Cardinality.MANY_TO_MANY],
//     ["Soloist","CompositionSoloist",Cardinality.ONE_TO_MANY],


// ]

// const Relations: {} = {
//     "Member": {
//         attributes: {
//             member_id:true,
//             name:false,
//             address:false
//         }
//     },
//     "Sub_Member": {
//         attributes: {

//         }
//     },
//     "Friend": {
//         attributes: {
//             friend_id:true,
//         }
//     },
// }
// const Connections = [
//     ["Member","Sub_Member",Cardinality.SUPER_TO_SUBTYPE],
//     ["Sub_Member","Friend",Cardinality.MANY_TO_MANY],
// ]

// const Relations: {} = {
//     CONTACT: {
//         attributes: {
//             contact_id:true,
//             first_name:false,
//             middle_initial:false,
//             last_name:false,
//             birthday:false,
//             url:false,
//             notes:false,
//             street1:false,
//             street2:false,
//             city:false,
//             state:false,
//             zip_code:false,
//             co_worker:false,
//             vendor:false,
//             personal:false,
//         }
//     },
//     EMAIL: {
//         attributes: {
//             email:true,
//         }
//     },
//     PHONE: {
//         attributes: {
//             phone_number:true,
//             phone_type_desc:false,
//         }
//     },
//     COMPANY: {
//         attributes: {
//             company_name:true,
//             company_url:false,
//             company_phone:false,
//             address:false,
//             city:false,
//             state:false,
//             zip_code:false,
//         }
//     },
//     CO_WORKER: {
//         attributes: {
//             office_number:false,
//         }
//     },
//     VENDOR: {
//         attributes: {

//         }
//     },
//     PERSONAL: {
//         attributes: {
//             street:false,
//             city:false,
//             state:false,
//             zip_code:false,
//             rel_or_Friend:false
//         }
//     },
//     RELATIVE: {
//         attributes: {
//             relationship:false,
//         }
//     },
//     FRIEND: {
//         attributes: {
//             know_from:false,
//         }
//     },
//     VENDOR_TYPE: {
//         attributes: {
//             vendor_type_id:true,
//             description:false,
//         }
//     },
// }
// const Connections = [
//     ["CONTACT","EMAIL",Cardinality.ONE_TO_MANY],
//     ["CONTACT","PHONE",Cardinality.MANY_TO_MANY],
//     ["CONTACT","COMPANY",Cardinality.MANY_TO_ONE],
//     ["COMPANY","COMPANY",Cardinality.ONE_TO_MANY],
//     ["CONTACT","CO_WORKER",Cardinality.SUPER_TO_SUBTYPE],
//     ["CONTACT","VENDOR",Cardinality.SUPER_TO_SUBTYPE],
//     ["CONTACT","PERSONAL",Cardinality.SUPER_TO_SUBTYPE],
//     ["VENDOR","VENDOR_TYPE",Cardinality.MANY_TO_MANY],
//     ["CO_WORKER","VENDOR",Cardinality.ONE_TO_ZERO],
//     ["PERSONAL","RELATIVE",Cardinality.SUPER_TO_SUBTYPE],
//     ["PERSONAL","FRIEND",Cardinality.SUPER_TO_SUBTYPE],
// ]

const Relations: {} = {
    "1": {
        attributes: {
            a:true,
            b:false
        },
    },
    "2": {
        attributes: {
            d:true,
            f:false,
            g:false,
            h:false,
        },
    },
    "4": {
        attributes: {
            l:true,
            m:true,
            n:true,

            i:false,
            j:false,
        },
    },
    "3": {
        attributes: {
            p:true,
            q:true,
            r:false,
        },
    },
    "5": {
        attributes: {
            s:false,
        },
        weak:true, // ------------------- note the weak
    },
    "6": {
        attributes: {
            t:true,
            u:false,
        },
    },
    "7": {
        attributes: {
            w:false,
        },
    },
    "8": {
        attributes: {
            y:false,
            z:false,
        },
    },
}
const Connections = [
    ["1","1",Cardinality.ONE_TO_MANY_NON_IDENTIFYING],
    ["1","2",Cardinality.MANY_TO_ONE_NON_IDENTIFYING],
    ["2","4",Cardinality.MANY_TO_MANY],
    ["3","4",Cardinality.ONE_TO_ZERO_NON_IDENTIFYING],
    ["3","5",Cardinality.ONE_TO_MANY],
    ["6","5",Cardinality.ONE_TO_MANY],
    ["6","7",Cardinality.SUPER_TO_SUBTYPE],
    ["6","8",Cardinality.SUPER_TO_SUBTYPE],
    
]
transpose(Relations, Connections)