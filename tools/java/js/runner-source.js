export const RUNNER_SOURCE = String.raw`import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

public class __JavaRunner {
    public static void main(String[] args) {
        System.setProperty("file.encoding", "UTF-8");
        prepareDataFiles(args);
        prepareInput();
        if (args.length == 0) {
            System.out.println("[sandbox] No main class was found.");
            System.exit(2);
        }
        String target = args[0];
        Class<?> clazz;
        try {
            clazz = Class.forName(target);
        } catch (ClassNotFoundException error) {
            System.out.println("[sandbox] Could not find class " + target + ".");
            System.exit(2);
            return;
        }
        Method main;
        try {
            main = clazz.getMethod("main", String[].class);
        } catch (NoSuchMethodException error) {
            System.out.println("[sandbox] " + target + " does not have a public static void main(String[] args) method.");
            System.exit(2);
            return;
        }
        if (!Modifier.isStatic(main.getModifiers())) {
            System.out.println("[sandbox] " + target + ".main must be static.");
            System.exit(2);
            return;
        }
        try {
            main.invoke(null, (Object) new String[0]);
        } catch (InvocationTargetException error) {
            Throwable cause = error.getCause();
            if (cause != null) cause.printStackTrace();
            else error.printStackTrace();
            System.exit(1);
        } catch (Throwable error) {
            error.printStackTrace();
            System.exit(1);
        }
    }

    private static void prepareDataFiles(String[] args) {
        for (int index = 1; index < args.length; index++) {
            String name = args[index];
            try {
                Path source = Paths.get("/str", name);
                if (Files.exists(source)) {
                    Files.copy(source, Paths.get(name), StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception error) {
                System.out.println("[sandbox] Could not prepare data file " + name + ": " + error.getMessage());
            }
        }
    }

    private static void prepareInput() {
        try {
            Path input = Paths.get("/str/input.txt");
            if (Files.exists(input)) {
                System.setIn(new FileInputStream(input.toFile()));
            } else {
                System.setIn(new ByteArrayInputStream(new byte[0]));
            }
        } catch (Exception error) {
            System.setIn(new ByteArrayInputStream(new byte[0]));
        }
    }
}
`;
