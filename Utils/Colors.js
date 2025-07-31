import { useColorScheme } from "react-native"

function useColors () {

    const isDark = useColorScheme() == "dark"

    const mainGreen = "#B4D71A"

    const errorRed = isDark ? "hsla(0, 100%, 62%, 0.702)" : "hsla(0, 100%, 50%, 0.42)"

    const placeholder = isDark ? "#c6c6c6c8" : "#a3a3a3ff"

    const text = isDark ? "white" : "black"

    const antiText = !isDark ? "white" : "black"

    const ligthText = isDark ? "#ffffffe1" : "#5c5c5c"

    const superLigthText = isDark ? "#ffffff60" : "#00000060"

    const label = isDark ? "#dddddd" : "#0000007e"

    const background = isDark ? "#272F29" : "#ffffff"

    const background2 = isDark ? "#202020" : "#ffffff"

    const input = isDark ? "#363636" : "#ffffff"

    const gray = isDark ? "#636363" : "#d9d9d9"

    const darker = isDark ? "#212522" : "#f7f7f7"

    const ligthBackground = isDark ? "#2a2b2a" : "#ffffff"

    return {
        mainGreen,
        background2,
        ligthBackground,
        placeholder,
        errorRed,
        antiText,
        gray,
        superLigthText,
        darker,
        text,
        ligthText,
        label,
        background,
        input
      }
    }

export default useColors