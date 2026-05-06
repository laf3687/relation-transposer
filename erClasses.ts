export class MustExistInConnection {
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

export class Attribute {
    public name;
    public identifier;
    public foreignKey;
    public datatype?: string;
    public foriegnKeyNotNULL = false;
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

    setForeignKeyNotNull(boolean: boolean) {
        this.foriegnKeyNotNULL = boolean
    }

    setDatatype(dt: string) {
        this.datatype = dt
    }

    toString() {
        let id = ""
        if (this.isIdentifier() || this.isForeignKey()) {
            let b = []
            if (this.isIdentifier()) { b.push("PK") }
            if (this.isForeignKey()) { b.push("FK") }
            id = " <<" + b.join(", ") + ">>"
        }

        return `${this.name}` + id
    }

}

export class Relation {
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
        return this.name + "(" + arr.join(", ") + ")" + mei
    }

}

export class Connection {
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