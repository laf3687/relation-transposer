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
    // 5/15/26 new addition for custom set recursive attribute names
    public recursiveAttributeName?: string;
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

    setRecursiveName(attributeName: string) {
        this.recursiveAttributeName = attributeName
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
    public weak: boolean = false;
    public isAssociativeEntity: boolean = false;

    private subTypeData = {
        "isSubType": false,
        "inheritedFrom": new Object
    }


    constructor(name: String, attributesIterable: Attribute[]) {
        this.name = name;
        attributesIterable.forEach(element => {
            this.attributes.set(element.name, element)
        });
        // this.weak = false;
        // if (this.getPrimaryKeys().size == 0) {
        //     this.isAssociativeEntity = true
        // }
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
            let meiMap = new Map<String, Map<String, String>[]>()
            // 5/15/26  must exist in new formatting (matches RIT standard)
            for (let m of this.mustExistIn) {
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
            }

            // console.log(meiMap)
            let i = 0
            meiMap.forEach((params, attribute) => {
                let attributeNames = []
                let referenceNames = []
                for (let reference of params) {
                    attributeNames.push(reference.get("attributeName"))
                    referenceNames.push(reference.get("referenceName"))
                }
                mei += `${this.name}(${attributeNames.join(", ")}) mei ${attribute}(${referenceNames.join(", ")})`

                if (i < meiMap.size - 1) {
                    mei += "\n\t"
                }
                i++
            })
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
// 5/16/25 adding a queue datastructure 
export class Queue<T> {
    private queueData: T[];
    private frontIndex;
    private backIndex;
    reset() {
        this.queueData = []; this.frontIndex = 0; this.backIndex = 0
    }
    constructor() {
        this.queueData = []
        this.frontIndex = 0
        this.backIndex = 0
    }

    emptyCheck() {
        if (this.isEmpty()) {
            throw new Error("Empty Queue.")
        }
    }

    enqueue(item: T): void {
        this.queueData.push(item)
        this.backIndex++
    }
    dequeue(): T {
        this.emptyCheck()
        const item = this.peek()
        this.queueData[this.frontIndex] = (null) as T // garbage collection?
        this.frontIndex++
        if (this.isEmpty()) {
            this.reset()
        }
        return item;

    }
    peek(): T {
        this.emptyCheck()
        return this.queueData[this.frontIndex]
    }
    isEmpty(): boolean {
        return this.size() == 0
    }
    size(): number {
        return this.backIndex - this.frontIndex
    }
    returnList(): T[] {
        return this.queueData
    }
}