package webtech.online.course.utils;

public class Common {

    public static String parserTime(Long t) {
        long hours = t / 3600;
        long minutes = (t % 3600) / 60;
        long seconds = t % 60;

        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
}
