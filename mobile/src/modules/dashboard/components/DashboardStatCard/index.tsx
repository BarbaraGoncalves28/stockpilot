import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { styles } from "./DashboardStatCard.styles";

export type DashboardStatAccent =
  | "green"
  | "yellow"
  | "red"
  | "blue";

type DashboardStatCardProps = {
  label: string;
  value: number;
  trend: number;
  periodLabel: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  accent: DashboardStatAccent;
};

const accentColors: Record<
  DashboardStatAccent,
  {
    border: string;
    background: string;
    glow: string;
    iconTop: string;
    iconBottom: string;
    description: string;
  }
> = {
  green: {
    border: "#00E599",
    background: "#09271F",
    glow: "#104D3C",
    iconTop: "#126A50",
    iconBottom: "#0D1520",
    description: "#00E599",
  },
  yellow: {
    border: "#FFB800",
    background: "#29220E",
    glow: "#59420D",
    iconTop: "#75550A",
    iconBottom: "#0D1520",
    description: "#FFB800",
  },
  red: {
    border: "#FF3366",
    background: "#2B111D",
    glow: "#5A1830",
    iconTop: "#741A38",
    iconBottom: "#0D1520",
    description: "#FF668A",
  },
  blue: {
    border: "#00D1FF",
    background: "#082631",
    glow: "#0B4659",
    iconTop: "#075D75",
    iconBottom: "#0D1520",
    description: "#00D1FF",
  },
};

export function DashboardStatCard({
  label,
  value,
  trend,
  periodLabel,
  icon,
  accent,
}: DashboardStatCardProps) {
  const theme = accentColors[accent];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          shadowColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            {
              borderColor: theme.border,
              backgroundColor: theme.iconTop,
              shadowColor: theme.border,
              shadowOpacity: 0.4,
              shadowRadius: 7,
              elevation: 4,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={theme.border}
          />
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.border}
        />
      </View>

      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={styles.value}
      >
        {value.toLocaleString("pt-BR")}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Ionicons
          name="arrow-up"
          size={12}
          color={theme.description}
        />

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.description,
            { color: theme.description },
          ]}
        >
          {`+${trend.toLocaleString("pt-BR")} ${periodLabel}`}
        </Text>
      </View>
    </View>
  );
}
