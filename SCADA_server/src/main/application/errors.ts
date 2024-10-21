export class PropertyError extends Error {
    propertyName : string

    constructor(propertyName : string, message : string, cause? : Error) {
        super(message, {cause})
        this.propertyName = propertyName
    }
}

export class PropertyNotFoundError extends PropertyError {
    propertyName : string

    constructor(propertyName : string, cause? : Error) {
        super(propertyName, `Value of property ${propertyName} is not been reached`, cause)
        this.propertyName = propertyName
    }
}

export class RepeatedPropertyError extends PropertyError {
    propertyName : string
    numOfOcurrencesName : number

    constructor(propertyName : string, numOfOcurrencesName : number, cause? : Error) {
        super(propertyName, `Property ${propertyName} appears ${numOfOcurrencesName} times across multiple PLC`, cause)
        this.propertyName = propertyName
        this.numOfOcurrencesName = numOfOcurrencesName
    }
}

export class PropertyWriteError extends PropertyError {
    propertyName : string
    value : string | number
    constructor(propertyName : string, value : string | number, cause? : Error) {
        super(propertyName, `Property ${propertyName} cant been writed with value: ${value}`, cause)
        this.propertyName = propertyName
        this.value = value
    }
}

export class RepositoryNotFoundError extends Error {
    repositoryName : string

    constructor(repositoryName : string, cause? : Error) {
        super(`Repository ${repositoryName} is not been reached`)
        this.repositoryName = repositoryName
    }
}