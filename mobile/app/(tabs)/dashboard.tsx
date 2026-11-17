import { useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../../src/auth/AuthContext";
import { colors } from "../../src/theme/colors";

import { useDashboard } from "../../src/modules/dashboard/hooks/useDashboard";
import { useDashboardMovements } from "../../src/modules/dashboard/hooks/useDashboardMovements";
import { styles } from "../../src/modules/dashboard/dashboard.styles";

import { DashboardGreeting } from "../../src/modules/dashboard/components/DashboardGreeting";
import { DashboardStats } from "../../src/modules/dashboard/components/DashboardStats";
import { StockFlow } from "../../src/modules/dashboard/components/StockFlow";
import { MovementChart } from "../../src/modules/dashboard/components/MovementChart";
import { IntelligenceAlerts } from "../../src/modules/stock-intelligence/components/IntelligenceAlerts";

export default function DashboardScreen() {
  const { user, accessToken } = useAuth();

  const {
    summary,
    alerts,
    loading,
    refreshing,
    error,
    selectedPeriod,
    periodLoading,
    loadDashboard,
    handlePeriodChange,
  } = useDashboard(accessToken);

  const {
    chartData,
    selectedPeriod: movementPeriod,
    periodMenuOpen,
    loading: movementsLoading,
    error: movementsError,
    handlePeriodChange: handleMovementPeriodChange,
    togglePeriodMenu,
  } = useDashboardMovements(accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/");
    }
  }, [accessToken]);

  if (!accessToken || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
      </View>
    );
  }

  if (loading && !summary) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color={colors.brand[500]} />
        </View>

        <Text style={styles.loadingTitle}>
          Carregando dashboard
        </Text>

        <Text style={styles.loadingDescription}>
          Buscando os dados mais recentes do seu estoque.
        </Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>

        <Text style={styles.errorTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.errorDescription}>{error}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => loadDashboard()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!summary) return null;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={colors.brand[500]}
          />
        }
      >
        <DashboardGreeting name={user.name} />

        {error ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{error}</Text>

            <TouchableOpacity
              onPress={() => loadDashboard()}
              activeOpacity={0.7}
            >
              <Text style={styles.inlineErrorAction}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <DashboardStats summary={summary} />

        <View style={styles.section}>
          <View style={styles.intelligenceCard}>
            <IntelligenceAlerts
              alerts={alerts}
              onViewAll={() =>
                router.push("/(tabs)/more/intelligence")
              }
              onSelectAlert={(productId) =>
                router.push(`/(tabs)/more/intelligence/${productId}`)
              }
            />
          </View>
        </View>

        <StockFlow
          summary={summary}
          selectedPeriod={selectedPeriod}
          periodLoading={periodLoading}
          onPeriodChange={handlePeriodChange}
        />

        <View style={styles.section}>
          <MovementChart
            data={chartData}
            loading={movementsLoading}
            error={movementsError}
            selectedPeriod={movementPeriod}
            menuOpen={periodMenuOpen}
            onToggleMenu={togglePeriodMenu}
            onSelectPeriod={handleMovementPeriodChange}
          />
        </View>

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

