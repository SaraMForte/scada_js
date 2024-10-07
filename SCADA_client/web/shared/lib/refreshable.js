var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function refreshLoop(refreshable, loopTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const refreshStep = () => refreshLoop(refreshable, loopTime);
        yield refreshable.refresh()
            .then(() => setTimeout(refreshStep, loopTime))
            .catch(error => {
            console.error(error);
            setTimeout(refreshStep, loopTime * 5);
        });
    });
}
//Clase Abstracta
class test1 {
    constructor(greetings1, greetings2) {
        this.greetings1 = greetings1;
        this.greetings2 = greetings2;
    }
    refre() {
        console.log(this.greetings1);
    }
    refreLoop() {
        console.log(this.greetings2);
    }
}
class test2 extends test1 {
    constructor(greetings1, greetings2) {
        super(greetings1, greetings2);
        this.greetings1 = greetings1;
        this.greetings2 = greetings2;
    }
}
const refreTest1 = new test2('hi', 'bonjour');
refreTest1.refre();
refreTest1.refreLoop();
