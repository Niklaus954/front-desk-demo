/**
 * 本地全局id生成器
 */
export class IdGenerator {
    private static i: number = 0;

    public static generate(): String {
        const id = IdGenerator.i.toString();
        IdGenerator.i++;
        return id;
    }
}