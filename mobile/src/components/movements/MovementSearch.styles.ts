import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: "#0B131E",
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 19,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    paddingVertical: 0,
  },
  button: {
    height: 52,
    paddingHorizontal: 17,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#00E599",
    borderRadius: 19,
  },
  buttonText: {
    color: "#050B14",
    fontSize: 13,
    fontWeight: "800",
  },
});
