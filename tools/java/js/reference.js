export const REFERENCE_HTML = `
<p class="ref-note">AP CSA 常用写法速查 · 编译环境使用 Java 8（考试涉及的语法都支持）</p>

<h3>Scanner · 控制台输入</h3>
<div class="ref-item"><code>new Scanner(System.in)</code><span class="desc">Create a scanner for the input panel.<span class="zh">从输入框读数，记得 import java.util.Scanner;</span></span></div>
<div class="ref-item"><code>hasNext()</code><span class="desc">Is there another token?<span class="zh">还有下一个输入吗？</span></span></div>
<div class="ref-item"><code>next() / nextLine()</code><span class="desc">Read a token / a whole line.<span class="zh">读一个单词 / 读一整行。</span></span></div>
<div class="ref-item"><code>nextInt() / nextDouble()</code><span class="desc">Read a number.<span class="zh">读整数 / 小数；输入不够会抛异常。</span></span></div>
<div class="ref-item"><code>input.close()</code><span class="desc">Close the scanner when done.<span class="zh">用完关闭（考试中通常可省略）。</span></span></div>

<h3>String · 字符串</h3>
<div class="ref-item"><code>length()</code><span class="desc">Number of characters.<span class="zh">字符数，不是 length 属性。</span></span></div>
<div class="ref-item"><code>charAt(i)</code><span class="desc">Character at index i.<span class="zh">下标从 0 开始。</span></span></div>
<div class="ref-item"><code>substring(a, b)</code><span class="desc">Characters from a up to, not including, b.<span class="zh">含头不含尾；只有一个参数时到结尾。</span></span></div>
<div class="ref-item"><code>indexOf(s)</code><span class="desc">First index of s, or -1.<span class="zh">找不到返回 -1。</span></span></div>
<div class="ref-item"><code>equals(other)</code><span class="desc">Compare text content. Never use == for Strings.<span class="zh">比较内容必须用 equals；== 比较的是对象引用。</span></span></div>
<div class="ref-item"><code>compareTo(other)</code><span class="desc">Negative, zero or positive.<span class="zh">按字典序比较，返回负数 / 0 / 正数。</span></span></div>
<div class="ref-item"><code>toUpperCase() / toLowerCase()</code><span class="desc">Return a new String.<span class="zh">返回新字符串，原字符串不变。</span></span></div>
<div class="ref-item"><code>trim()</code><span class="desc">Remove leading and trailing spaces.<span class="zh">去掉首尾空白。</span></span></div>

<h3>Math · 数学</h3>
<div class="ref-item"><code>Math.abs(x)</code><span class="desc">Absolute value.<span class="zh">绝对值。</span></span></div>
<div class="ref-item"><code>Math.pow(a, b)</code><span class="desc">a to the power b (returns double).<span class="zh">幂，返回 double。</span></span></div>
<div class="ref-item"><code>Math.sqrt(x)</code><span class="desc">Square root.<span class="zh">平方根。</span></span></div>
<div class="ref-item"><code>Math.random()</code><span class="desc">A double in [0, 1).<span class="zh">[0, 1) 的小数；随机整数要乘范围再加起点。</span></span></div>
<div class="ref-item"><code>(int) (Math.random() * 6) + 1</code><span class="desc">A die roll from 1 to 6.<span class="zh">先乘范围、再转 int、最后加起点。</span></span></div>

<h3>Arrays · 数组</h3>
<div class="ref-item"><code>int[] a = new int[5];</code><span class="desc">Default values are 0.<span class="zh">int 默认 0，boolean 默认 false，对象默认 null。</span></span></div>
<div class="ref-item"><code>int[] a = {3, 8, 1};</code><span class="desc">Initializer list.<span class="zh">声明时直接给初值。</span></span></div>
<div class="ref-item"><code>a.length</code><span class="desc">Number of elements (no parentheses).<span class="zh">是属性，不加括号。</span></span></div>
<div class="ref-item"><code>for (int x : a)</code><span class="desc">For-each: read every value.<span class="zh">增强 for 循环；不能通过它修改数组元素。</span></span></div>

<h3>ArrayList · 列表</h3>
<div class="ref-item"><code>ArrayList&lt;String&gt; list = new ArrayList&lt;String&gt;();</code><span class="desc">Create a list (import java.util.ArrayList).<span class="zh">需要 import；不能存 int，要写 Integer。</span></span></div>
<div class="ref-item"><code>list.add(value)</code><span class="desc">Append at the end.<span class="zh">加到末尾；add(i, value) 插到下标 i。</span></span></div>
<div class="ref-item"><code>list.get(i)</code><span class="desc">Read an element.<span class="zh">不能像数组那样用 list[i]。</span></span></div>
<div class="ref-item"><code>list.set(i, value)</code><span class="desc">Replace an element.<span class="zh">替换并返回旧值。</span></span></div>
<div class="ref-item"><code>list.remove(i) / remove(value)</code><span class="desc">Remove by index or by value.<span class="zh">注意重载：remove(2) 删下标，remove("A") 删元素。</span></span></div>
<div class="ref-item"><code>list.size()</code><span class="desc">Number of elements.<span class="zh">是方法，要加括号。</span></span></div>
<div class="ref-item"><code>list.contains(value)</code><span class="desc">Is the value present?<span class="zh">是否存在该元素。</span></span></div>

<h3>2D arrays · 二维数组</h3>
<div class="ref-item"><code>int[][] grid = new int[3][4];</code><span class="desc">3 rows, 4 columns.<span class="zh">先行后列，默认值为 0。</span></span></div>
<div class="ref-item"><code>grid.length</code><span class="desc">Number of rows.<span class="zh">行数。</span></span></div>
<div class="ref-item"><code>grid[r].length</code><span class="desc">Number of columns in row r.<span class="zh">第 r 行的列数。</span></span></div>
<div class="ref-item"><code>grid[r][c]</code><span class="desc">One cell.<span class="zh">先取行，再取列。</span></span></div>

<h3>Files · 文件与数据集</h3>
<div class="ref-item"><code>new File("scores.txt")</code><span class="desc">A built-in data file. See Data files in the sidebar.<span class="zh">内置数据文件；文件名必须与左侧 Data files 完全一致。</span></span></div>
<div class="ref-item"><code>new Scanner(new File("scores.txt"))</code><span class="desc">Read the file token by token.<span class="zh">需要 import java.io.File; 读文件的方法要 throws FileNotFoundException。</span></span></div>
<div class="ref-item"><code>while (file.hasNext())</code><span class="desc">Loop until the file has no more tokens.<span class="zh">逐词读取；hasNextLine() 则按行。</span></span></div>
<div class="ref-item"><code>file.close()</code><span class="desc">Close the file scanner.<span class="zh">读完关闭。</span></span></div>

<h3>Casting · 类型转换</h3>
<div class="ref-item"><code>(double) sum / count</code><span class="desc">Cast before dividing so the result is a decimal.<span class="zh">先转 double 再除；int / int 会截断小数。</span></span></div>
<div class="ref-item"><code>(int) 3.9</code><span class="desc">Truncates toward zero, giving 3.<span class="zh">直接截断小数，不四舍五入。</span></span></div>
<div class="ref-item"><code>Integer.parseInt("42")</code><span class="desc">String to int.<span class="zh">字符串转整数；格式不对会抛 NumberFormatException。</span></span></div>
<div class="ref-item"><code>Double.parseDouble("3.14")</code><span class="desc">String to double.<span class="zh">字符串转小数。</span></span></div>

<h3>Before you run · 运行前检查</h3>
<div class="ref-item"><code>public class Main</code><span class="desc">The file name and public class name should match.<span class="zh">保存名不影响运行；public 类名会自动作为编译文件名。</span></span></div>
<div class="ref-item"><code>public static void main(String[] args)</code><span class="desc">The JVM starts here.<span class="zh">入口方法：public、static、void、String[] 都要有。</span></span></div>
<div class="ref-item"><code>import java.util.Scanner;</code><span class="desc">Put imports at the top, before the class.<span class="zh">import 必须在类定义之前。</span></span></div>
`;
