"use strict";
import {MustExistInConnection, Attribute, Relation, Connection} from "./erClasses.ts"


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
        if (manyToMany) {
            // console.log("M:M")
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
        for (let a in attributes) {
            let identifierBoolean = attributes[a]
            let newAttribute = new Attribute(a, identifierBoolean, false)
            if (relations[i]["datatypes"]) { // new code to handle explicit data types
                if (relations[i]["datatypes"][a]) {
                    newAttribute.setDatatype(relations[i]["datatypes"][a])
                }
            }
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


// figure out a better way to do this (hashmap?)

function setConnection(relation1: Relation, relation2: Relation, connectionType: string) {
    // console.log("CONNECTION TYPE:"+connectionType)
    if (connectionType === Cardinality.SUPER_TO_SUBTYPE) {
        setSubtypeRelationConnection(relation1, relation2, "placeholder")
    }
    // ----------------------1:1--------------------------
    if (connectionType === Cardinality.ONE_TO_ZERO) {
        setOneToManyConnection(relation1, relation2, false, true, false, true)
    }
    if (connectionType === Cardinality.ZERO_TO_ONE) {
        setOneToManyConnection(relation2, relation1, false, true, false, true)
    }
    if (connectionType === Cardinality.ONE_TO_ZERO_NID) {
        setOneToManyConnection(relation1, relation2, false, false, false, true)
    }
    if (connectionType === Cardinality.ZERO_TO_ONE_NID) {
        setOneToManyConnection(relation2, relation1, false, false, false, true)
    }
    // ----------------------1:M-------------------------
    if (connectionType === Cardinality.ZERO_TO_MANY_ZERO) {
        setOneToManyConnection(relation1, relation2, false, true, false, false)
    }
    if (connectionType === Cardinality.ZERO_TO_MANY_ONE) {
        setOneToManyConnection(relation1, relation2, false, true, false, false)
    }
    if (connectionType === Cardinality.ONE_TO_MANY_ZERO) {
        setOneToManyConnection(relation1, relation2, false, true, false, true)
    }
    if (connectionType === Cardinality.ONE_TO_MANY_ONE) {
        setOneToManyConnection(relation1, relation2, false, true, false, true)
    }
    if (connectionType === Cardinality.ZERO_TO_MANY_ZERO_NID) {
        setOneToManyConnection(relation1, relation2, false, false, false, false)
    }
    if (connectionType === Cardinality.ZERO_TO_MANY_ONE_NID) {
        setOneToManyConnection(relation1, relation2, false, false, false, false)
    }
    if (connectionType === Cardinality.ONE_TO_MANY_ZERO_NID) {
        setOneToManyConnection(relation1, relation2, false, false, false, true)
    }
    if (connectionType === Cardinality.ONE_TO_MANY_ONE_NID) {
        setOneToManyConnection(relation1, relation2, false, false, false, true)
    }
    // --------------------M:1---------------------------
    if (connectionType === Cardinality.MANY_ZERO_TO_ZERO) {
        setOneToManyConnection(relation2, relation1, false, true, false, false)
    }
    if (connectionType === Cardinality.MANY_ONE_TO_ZERO) {
        setOneToManyConnection(relation2, relation1, false, true, false, false)
    }
    if (connectionType === Cardinality.MANY_ZERO_TO_ONE) {
        setOneToManyConnection(relation2, relation1, false, true, false, true)
    }
    if (connectionType === Cardinality.MANY_ONE_TO_ONE) {
        setOneToManyConnection(relation2, relation1, false, true, false, true)
    }
    if (connectionType === Cardinality.MANY_ZERO_TO_ZERO_NID) {
        setOneToManyConnection(relation2, relation1, false, false, false, false)
    }
    if (connectionType === Cardinality.MANY_ONE_TO_ZERO_NID) {
        setOneToManyConnection(relation2, relation1, false, false, false, false)
    }
    if (connectionType === Cardinality.MANY_ZERO_TO_ONE_NID) {
        setOneToManyConnection(relation2, relation1, false, false, false, true)
    }
    if (connectionType === Cardinality.MANY_ONE_TO_ONE_NID) {
        setOneToManyConnection(relation2, relation1, false, false, false, true)
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
        let createStatement = `${colorString("CREATE TABLE",0,155,255)} ${colorString(r.name.toLowerCase(),255,255,255)} (`
        let stringArray: string[] = []
        let displayedFKComment = false
        r.getAttributes().forEach(a => {
            let defaultString = `\n    ${a.name} `
            if (a.datatype) {
                defaultString += colorString(a.datatype,100,241,153)
            } else {
                defaultString += "___________"
            }
            if (a.isForeignKey() && !displayedFKComment) {
                stringArray.push(`\n\n    ${colorString("# ----[ FOREIGN KEYS ]----",188,20,34)}`)
                displayedFKComment = true;
            }
            if (a.isForeignKey() && !a.isIdentifier() && a.foriegnKeyNotNULL == true) { // if FK and NOT PK and if it is signified from a 1 on the ER diagram, Not Null is required.
                defaultString += colorString(" NOT NULL",255,40,40)
            }

            stringArray.push(defaultString)
        })
        stringArray.push(`\n\n    ${colorString("# ----[ CONSTRAINTS ]----",188,20,34)}`)
        let pks: string[] = [] // primary key names

        r.getAttributes().forEach(a => {
            if (a.isIdentifier()) {
                pks.push(a.name)
            }
        })


        if (pks.length > 0) {
            let defaultString = `\n    ${colorString("CONSTRAINT",0,155,255)} ${r.name.toLowerCase()}_pk ${colorString("PRIMARY KEY",187,0,255)} (${pks.join(", ")})`
            stringArray.push(defaultString)
        }

        let meiMap = new Map<String,Map<String,String>[]>()

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
            let bruh = new Map()
            bruh.set("attributeName",attributeName)
            bruh.set("referenceName",referenceName)
            meiMap.get(relationName)?.push(bruh)
        })

        meiMap.forEach((params,attribute) => {
            let attributeNames = []
            let referenceNames = []
            for (let reference of params) {
                attributeNames.push(reference.get("attributeName"))
                referenceNames.push(reference.get("referenceName"))
            }
            let defaultString = `\n    ${colorString("CONSTRAINT",0,155,255)} ${r.name.toLowerCase()}_${attribute}_fk ${colorString("FOREIGN KEY",210,210,23)} (${attributeNames.join(", ")}) ${colorString("REFERENCES",210,210,23)} ${attribute} (${referenceNames.join(", ")})`
            defaultString += `\n        ${colorString("ON UPDATE CASCADE",255,255,255)}`
            defaultString += `\n        ${colorString("ON DELETE CASCADE",255,255,255)}`
            stringArray.push(defaultString)
        })
        createStatement += stringArray.join(",")
        createStatement += "\n);"
        console.log(createStatement)
    })
}

const Relations: {} = {
    user: {
        attributes: {
            user_id: true,
            username: false,
            first_name: false,
            middle_name: false,
            last_name: false,
            email: false,
            phone_num: false,
            birth_date: false,
            pronouns: false,
            nickname: false,
            hometown: false,
            homepage_link: false,
            profile_picture_link: false,
            student_or_staff: false,
        },
        datatypes: {
            user_id: "INT UNSIGNED AUTO_INCREMENT",
            username: "VARCHAR(50) UNIQUE NOT NULL",
            first_name: "VARCHAR(50)",
            middle_name: "VARCHAR(50)",
            last_name: "VARCHAR(50)",
            email: "VARCHAR(255) NOT NULL",
            phone_num: "VARCHAR(50)",
            birth_date: "DATE",
            pronouns: "VARCHAR(50)",
            nickname: "VARCHAR(50)",
            hometown: "VARCHAR(50)",
            homepage_link: "VARCHAR(255)",
            profile_picture_link: "VARCHAR(255)",
            student_or_staff: "ENUM('student','teacher') NOT NULL",
        }
    },

    student: {
        attributes: {

        }
    },

    staff: {
        attributes: {
            teacher_or_teacher_assistant: false 
        },
        datatypes: {
            teacher_or_teacher_assistant: "ENUM('teacher','teacher_assistant') NOT NULL"
        }
    },

    teacher: {
        attributes: {

        }
    },

    teacher_assistant: { 
        attributes: {

        }
    },

    login_info: {
        attributes: {
            hashed_password:false
        },
        datatypes: {
            hashed_password:"VARCHAR(255)"
        },
        weak:true
    },

    course: {
        attributes: {
            course_section: true,
            course_year: true,
            course_name: false,
            course_description: false,
        },
        datatypes: {
            course_section: "INT UNSIGNED",
            course_year: "YEAR",
            course_name: "VARCHAR(50)",
            course_description: "VARCHAR(255)",
        }
    },
    announcements: {
        attributes: {
            datetime_posted: false,
            announcement: false
        },
        datatypes:{
            datetime_posted: "DATETIME",
            announcement: "VARCHAR(2000)"
        },
        weak: true,
    },
    gradable: {
        attributes: {
            gradable_id: true,
            points: false,
            weight: false,
            start_date: false,
            due_date: false,
            gradable_type: false,
        },
        datatypes: {
            gradable_id: "INT UNSIGNED AUTO_INCREMENT",
            points: "INT",
            weight: "DECIMAL(5,2)",
            start_date: "DATETIME",
            due_date: "DATETIME",
            gradable_type: "ENUM('quiz','discussion_forum','assignment')",
        }
    },

    student_gradable:{ 
        attributes: {
            grade_received:false,
            comment:false,
        },
        weak:true,
        datatypes: {
            grade_received:"INT",
            comment:"VARCHAR(2000)",
        }
    },


    assignment: {
        attributes: {
            assignment_details: false
        },
        datatypes: {
            assignment_details: "VARCHAR(500)"
        }
    },
    discussion_forum: {
        attributes: {
            discussion_details: false,
        },
        datatypes: {
            discussion_details: "VARCHAR(500)"
        }
        // weak: true,
    },
    discussion_post: {
        attributes: {
            post_id: true,
            message: false
            // reply_id
        },
        datatypes: {
            post_id: "INT UNSIGNED AUTO_INCREMENT",
            message: "VARCHAR(2000)"
        }
    },
    quiz: {
        attributes: {

        },
        weak: true,
    },
    quiz_question: {
        attributes: {
            question_number: true,
            question: false,
        },
        datatypes: {
            question_number: "INT UNSIGNED AUTO_INCREMENT",
            question: "VARCHAR(500)"
        },
        weak: true
    },

    question_answer: {
        attributes: {
            answer:false,
            answer_type: false
        },
        datatypes:{
            answer:"VARCHAR(500)",
            answer_type:"ENUM ('free_response','multiple_choice')"
        },
        weak: true,
    },


    free_response: {
        attributes: {
            // answer: false
        }
    },
    multiple_choice: {
        attributes: {
            is_answer: false
        },
        datatypes: {
            is_answer: "TINYINT(1)"
        }
    }
}

const Connections = [
    ["user", "course", Cardinality.MANY_TO_MANY],

    ["user","login_info",Cardinality.ONE_TO_MANY_ONE],
    ["course", "gradable", Cardinality.ONE_TO_MANY_ZERO],
    ["course", "announcements", Cardinality.ONE_TO_MANY_ZERO],
    ["gradable", "quiz", Cardinality.SUPER_TO_SUBTYPE],
    ["gradable", "discussion_forum", Cardinality.SUPER_TO_SUBTYPE],
    ["gradable", "assignment", Cardinality.SUPER_TO_SUBTYPE],
    ["discussion_forum", "discussion_post", Cardinality.ONE_TO_MANY_ZERO],
    ["discussion_post", "discussion_post", Cardinality.ONE_TO_MANY_ZERO],
    ["quiz", "quiz_question", Cardinality.ONE_TO_MANY_ONE],
    ["quiz_question", "question_answer", Cardinality.ONE_TO_MANY_ONE],
    ["question_answer", "free_response", Cardinality.SUPER_TO_SUBTYPE],
    ["question_answer", "multiple_choice", Cardinality.SUPER_TO_SUBTYPE],

    ["user","student",Cardinality.SUPER_TO_SUBTYPE],
    ["user","staff",Cardinality.SUPER_TO_SUBTYPE],
    ["staff","teacher",Cardinality.SUPER_TO_SUBTYPE],
    ["staff","teacher_assistant",Cardinality.SUPER_TO_SUBTYPE],

    ["student","student_gradable",Cardinality.ONE_TO_MANY_ZERO],
    ["gradable","student_gradable",Cardinality.ONE_TO_MANY_ZERO],

]

relation_to_sql()


// console.log(`\x1b[38;2;${255};${0};${0}m${'yo'}\x1b[0m`)
// console.log(colorString("hello",255,0,255))