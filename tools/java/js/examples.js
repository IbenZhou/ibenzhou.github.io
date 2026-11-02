const ex = (name, group, blurb, code, inputs = []) => ({
  name,
  group,
  blurb,
  inputs,
  code: code.replace(/^\n/, "").replace(/\s+$/, "\n"),
});

export const EXAMPLES = [
  ex("Hello, Java", "Basics", "Print two lines", `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("AP CSA");
    }
}
`),

  ex("Name and age", "Basics", "Read a whole line, then an int", `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Name: ");
        String name = input.nextLine();
        System.out.print("Age: ");
        int age = input.nextInt();
        System.out.println(name + " is " + age + " years old.");
        input.close();
    }
}
`, ["Ada", "17"]),

  ex("Letter grade", "Selection", "if / else if chains", `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int score = input.nextInt();
        char grade;

        if (score >= 90) {
            grade = 'A';
        } else if (score >= 80) {
            grade = 'B';
        } else if (score >= 70) {
            grade = 'C';
        } else {
            grade = 'F';
        }

        System.out.println("Score " + score + " = " + grade);
    }
}
`, ["86"]),

  ex("Sum and average", "Loops", "A for loop and a cast", `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        int sum = 0;

        for (int i = 1; i <= n; i++) {
            sum += i;
        }

        System.out.println("Sum: " + sum);
        System.out.println("Average: " + (double) sum / n);
    }
}
`, ["10"]),

  ex("Reverse digits", "Loops", "while loop with % and /", `
public class Main {
    public static void main(String[] args) {
        int n = 4729;
        int reversed = 0;

        while (n > 0) {
            reversed = reversed * 10 + n % 10;
            n /= 10;
        }

        System.out.println("Reversed: " + reversed);
    }
}
`),

  ex("Methods", "Methods & objects", "Return values and parameters", `
public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 6; i++) {
            System.out.println(i + " even? " + isEven(i));
        }
        System.out.println("Average: " + average(3, 7, 8));
    }

    public static boolean isEven(int value) {
        return value % 2 == 0;
    }

    public static double average(int a, int b, int c) {
        return (a + b + c) / 3.0;
    }
}
`),

  ex("Student class", "Methods & objects", "Fields, constructor and methods", `
public class Main {
    public static void main(String[] args) {
        Student student = new Student("Ada", 92);
        student.addPoints(5);
        System.out.println(student.getName() + ": " + student.getScore());
    }
}

class Student {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    public String getName() {
        return name;
    }

    public int getScore() {
        return score;
    }

    public void addPoints(int points) {
        score += points;
    }
}
`),

  ex("Array statistics", "Arrays & lists", "Traverse an array with a for loop", `
public class Main {
    public static void main(String[] args) {
        int[] scores = {88, 92, 79, 95, 84};
        int sum = 0;
        int max = scores[0];

        for (int i = 0; i < scores.length; i++) {
            sum += scores[i];
            if (scores[i] > max) {
                max = scores[i];
            }
        }

        System.out.println("Sum: " + sum);
        System.out.println("Average: " + (double) sum / scores.length);
        System.out.println("Max: " + max);
    }
}
`),

  ex("ArrayList of names", "Arrays & lists", "add / remove / for-each", `
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<String>();
        names.add("Ada");
        names.add("Grace");
        names.add("Linus");
        names.remove("Grace");

        for (String name : names) {
            System.out.println(name);
        }
        System.out.println("Size: " + names.size());
    }
}
`),

  ex("2D array rows", "Arrays & lists", "Nested loops over a grid", `
public class Main {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        for (int row = 0; row < grid.length; row++) {
            int sum = 0;
            for (int col = 0; col < grid[row].length; col++) {
                sum += grid[row][col];
            }
            System.out.println("Row " + row + " sum = " + sum);
        }
    }
}
`),

  ex("Palindrome", "Strings, files & data", "String methods and two pointers", `
import java.util.Scanner;

public class Main {
    public static boolean isPalindrome(String text) {
        String clean = text.toLowerCase();
        int left = 0;
        int right = clean.length() - 1;

        while (left < right) {
            if (clean.charAt(left) != clean.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        String word = input.nextLine();
        System.out.println(isPalindrome(word) ? "yes" : "no");
    }
}
`, ["Racecar"]),

  ex("Roll a die", "Strings, files & data", "Math.random and casting", `
public class Main {
    public static void main(String[] args) {
        int sixes = 0;

        for (int i = 0; i < 10; i++) {
            int die = (int) (Math.random() * 6) + 1;
            if (die == 6) {
                sixes++;
            }
            System.out.print(die + " ");
        }

        System.out.println();
        System.out.println("Sixes: " + sixes);
    }
}
`),

  ex("Read scores.txt", "Strings, files & data", "Scanner reading a built-in data file", `
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws FileNotFoundException {
        Scanner file = new Scanner(new File("scores.txt"));
        int total = 0;
        int count = 0;

        while (file.hasNext()) {
            String name = file.next();
            int score = file.nextInt();
            System.out.println(name + ": " + score);
            total += score;
            count++;
        }

        file.close();
        System.out.println("Average: " + (double) total / count);
    }
}
`),
];
