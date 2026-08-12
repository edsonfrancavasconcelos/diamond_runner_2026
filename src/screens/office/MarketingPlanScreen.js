import React, { useState, useContext } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Traduções
import { CountryContext } from '../../i18n/context/CountryContext';
import * as AllTexts from '../../i18n/hooks/texts';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0e3057',
  card: 'rgba(255, 255, 255, 0.06)',
  primary: '#39afde',
  gold: '#ffbf00',
  textMain: '#FFFFFF',
  textSub: '#a4bccc',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#2ecc71',
};

const Section = ({ title, children, icon, color = COLORS.primary }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}
        style={styles.sectionHeader}
      >
        <View style={styles.row}>
          <Ionicons
            name={icon}
            size={20}
            color={color}
            style={{ marginRight: 12 }}
          />
          <Text style={styles.sectionTitle}>
            {title ? title.toUpperCase() : ''}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textSub}
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

export default function MarketingPlanScreen() {
  const navigation = useNavigation();
  const { country = 'BR' } = useContext(CountryContext) || {};
  const texts = AllTexts.marketingTexts?.[country] || AllTexts.marketingTexts?.BR || {};

  const cur = texts.currency || 'R$';
  const locale = texts.locale || 'pt-BR';
  const currentRate = texts.rateToBRL || 1;

  const formatCurrency = (amountBRL) => {
    const finalAmount = amountBRL * currentRate;
    return Number(finalAmount).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerArea}>
        <Text style={styles.mainTitle}>DIAMOND RUNNER</Text>
        <Text style={styles.subtitle}>
         
        </Text>
      </View>
              <Section title="Chave de Ativação Mensal" icon="key-outline" color={COLORS.gold}>
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>STATUS ATIVO = 5 APPS (50 PTS)</Text>
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.infoText, { fontStyle: 'normal', color: COLORS.textMain }]}>
                Para ser considerado <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>{"ATIVO"}</Text>, gere 5 apps ativos (próprios ou clientes), combinando livremente:
              </Text>
              <Text style={styles.planText}>• Apps próprios / Clientes diretos / Novas vendas</Text>
              <Text style={styles.planText}>• Mínimo: 5 apps = 50 pontos/mês (10 pts por app)</Text>
            </View>
            <View style={styles.comboTable}>
              {[
                '5 apps próprios',
                '3 próprios + 2 clientes',
                '1 próprio + 4 clientes',
                '5 clientes',
                '5 vendas novas',
                '2 próprios + 3 vendas',
              ].map((item, index) => (
                <View key={index} style={styles.comboRow}>
                  <Text style={styles.comboText}>{item}</Text>
                  <Text style={styles.successIcon}>✅</Text>
                </View>
              ))}
            </View>
            <View style={styles.financeBox}>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.financeLabel}>Investimento Máx.</Text>
                <Text style={styles.financeText}>{cur} {formatCurrency(199.75)}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.financeLabel}>Lucro (5 Vendas)</Text>
                <Text style={[styles.financeText, { color: COLORS.primary }]}>{cur} {formatCurrency(199.75)}</Text>
              </View>
            </View>
            <View style={{ marginTop: 15 }}>
              <Text style={styles.complianceFootnote}>
                {"📌 O plano exige volume, não consumo forçado."}
              </Text>
            </View>
          </View>
        </Section>      
      

   <Section title={texts.directReferral || "Indicação Direta"} icon="people-outline">
  <View style={styles.highlightCard}>
    
    {/* Alerta de Ganhos Pausados */}
    <View style={[styles.typeBox, { backgroundColor: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.3)', borderWidth: 1, marginBottom: 15 }]}>
      <Text style={[styles.infoText, { color: '#ff7675', fontWeight: 'bold', fontSize: 12 }]}>
        ⚠️ STATUS INATIVO: Pausa o recebimento de comissões, mas preserva seus pontos acumulados.
      </Text>
    </View>

    <Text style={styles.typeTitle}>💰 COMISSÃO POR ADESÃO</Text>
    <Text style={[styles.infoText, { marginBottom: 15 }]}>
      Ganhe sempre que um novo parceiro adquirir um pacote através do seu link ou da sua equipe até o 5º nível.
    </Text>

    {/* Tabela de Ganhos por Nível */}
    <View style={styles.comboTable}>
      <View style={[styles.comboRow, { borderBottomColor: COLORS.primary, borderBottomWidth: 1 }]}>
        <Text style={[styles.comboText, { fontWeight: 'bold', color: COLORS.primary, flex: 2 }]}>NÍVEL</Text>
        <Text style={[styles.comboText, { fontWeight: 'bold', color: COLORS.primary, flex: 1, textAlign: 'center' }]}>%</Text>
        <Text style={[styles.comboText, { fontWeight: 'bold', color: COLORS.primary, flex: 2, textAlign: 'right' }]}>GANHO ESTIMADO</Text>
      </View>

      <View style={styles.comboRow}>
        <Text style={[styles.comboText, { flex: 2, fontWeight: 'bold' }]}>1º (Diretos)</Text>
        <Text style={[styles.comboText, { flex: 1, textAlign: 'center' }]}>10%</Text>
        <Text style={[styles.comboText, { flex: 2, textAlign: 'right', color: COLORS.success }]}>{cur} {formatCurrency(159.90)}</Text>
      </View>

      <View style={styles.comboRow}>
        <Text style={[styles.comboText, { flex: 2 }]}>2º Nível</Text>
        <Text style={[styles.comboText, { flex: 1, textAlign: 'center' }]}>3%</Text>
        <Text style={[styles.comboText, { flex: 2, textAlign: 'right' }]}>{cur} {formatCurrency(47.97)}</Text>
      </View>

      <View style={styles.comboRow}>
        <Text style={[styles.comboText, { flex: 2 }]}>3º Nível</Text>
        <Text style={[styles.comboText, { flex: 1, textAlign: 'center' }]}>2%</Text>
        <Text style={[styles.comboText, { flex: 2, textAlign: 'right' }]}>{cur} {formatCurrency(31.98)}</Text>
      </View>

      <View style={[styles.comboRow, { borderBottomWidth: 0 }]}>
        <Text style={[styles.comboText, { flex: 2 }]}>4º ao 5º</Text>
        <Text style={[styles.comboText, { flex: 1, textAlign: 'center' }]}>1%</Text>
        <Text style={[styles.comboText, { flex: 2, textAlign: 'right' }]}>{cur} {formatCurrency(15.99)}</Text>
      </View>
    </View>

    <View style={[styles.ruleBox, { marginTop: 15, padding: 10 }]}>
      <Text style={[styles.complianceFootnote, { color: COLORS.textMain, textAlign: 'center' }]}>
        *Valores baseados no Pacote Elite. Ganhos proporcionais ao pacote de entrada do indicado.
      </Text>
    </View>
  </View>
</Section>


  <Section title={texts.binaryBonus || "Bônus Binário"} icon="git-branch-outline">
  <View style={styles.highlightCard}>
    {/* Alerta de Qualificação */}
    <View style={[styles.ruleBox, { borderColor: COLORS.gold, backgroundColor: 'rgba(255, 215, 0, 0.05)' }]}>
      <View style={styles.row}>
        <Ionicons name="shield-checkmark" size={18} color={COLORS.gold} />
        <Text style={[styles.comboText, { fontWeight: 'bold', color: COLORS.gold, marginLeft: 8 }]}>
          REQUISITO DE QUALIFICAÇÃO
        </Text>
      </View>
      <Text style={[styles.infoText, { marginTop: 5, color: COLORS.textMain }]}>
        • Estar {"\"Ativo\""} (50 pts pessoais no mês).{"\n"}
        • Ter 1 direto Ativo na Esquerda e 1 na Direita.
      </Text>
    </View>

    {/* Explicação do Ganhos */}
    <View style={{ marginTop: 15 }}>
      <Text style={styles.typeTitle}>📊 COMO FUNCIONA</Text>
      <Text style={styles.infoText}>
        Você recebe sobre a pontuação da sua <Text style={{ fontWeight: 'bold', color: COLORS.success }}>Equipe Menor</Text>. Toda nova adesão ou upgrade na rede gera pontos que se convertem em dinheiro diariamente.
      </Text>
    </View>

    {/* Tabela de Porcentagem por Pacote */}
    <View style={styles.comboTable}>
      <View style={styles.comboRow}>
        <Text style={styles.comboText}>Builder / Afiliado</Text>
        <Text style={[styles.comboText, { color: COLORS.primary }]}>10%</Text>
      </View>
      <View style={styles.comboRow}>
        <Text style={styles.comboText}>Prime</Text>
        <Text style={[styles.comboText, { color: COLORS.primary }]}>15%</Text>
      </View>
      <View style={[styles.comboRow, { borderBottomWidth: 0 }]}>
        <Text style={[styles.comboText, { color: COLORS.gold, fontWeight: 'bold' }]}>Elite (Máximo)</Text>
        <Text style={[styles.comboText, { color: COLORS.gold, fontWeight: 'bold' }]}>20%</Text>
      </View>
    </View>

    <Text style={[styles.complianceFootnote, { marginTop: 10, textAlign: 'center' }]}>
      *Os pontos da perna maior acumulam para o dia seguinte.
    </Text>
  </View>
</Section>


<Section title={texts.entryPackages || "Pacotes de Entrada"} icon="gift-outline">
  <Text style={styles.touchHint}>
    {texts.touchHint || "Toque para adquirir ou fazer upgrade:"}
  </Text>
  
  {/* Card de Afiliado Premium */}
  <TouchableOpacity 
    activeOpacity={0.9}
    style={[styles.pkgCard, { 
      width: '100%', 
      marginBottom: 15, 
      backgroundColor: 'rgba(44, 148, 188, 0.15)',
      borderStyle: 'dashed',
      borderColor: COLORS.primary,
      borderWidth: 1,
      padding: 15
    }]}
    onPress={() => navigation.navigate('Packages')}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <View style={styles.row}>
          <Ionicons name="shield-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.pkgTitle, { marginBottom: 0, fontSize: 16 }]}>
            {texts.affiliateTitle || "AFILIADO"}
          </Text>
        </View>
        <Text style={[styles.pkgApps, { textAlign: 'left', marginTop: 4, color: COLORS.textMain }]}>
          {texts.uniqueFee || 'Taxa Única de Licença Anual'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.pkgPrice, { fontSize: 18, color: COLORS.white }]}>
          {cur} {formatCurrency(99.00)}
        </Text>
        <Text style={{ fontSize: 9, color: COLORS.success, fontWeight: 'bold' }}>ATIVO POR 1 ANO</Text>
      </View>
    </View>
  </TouchableOpacity>

  {/* Linha de Pacotes Profissionais */}
  <View style={[styles.pkgRow, { justifyContent: 'space-between' }]}>
    {[
      { t: 'BUILDER', v: 299, a_val: 7, icon: 'flash-outline' },
      { t: 'PRIME', v: 799, a_val: 20, icon: 'flame-outline' },
      { t: 'ELITE', v: 1599, a_val: 40, icon: 'diamond-outline', gold: true },
    ].map((pkg, i) => (
      <TouchableOpacity
        key={i}
        activeOpacity={0.8}
        style={[
          styles.pkgCard, 
          { 
            width: (width - 75) / 3, 
            paddingVertical: 15,
            paddingHorizontal: 5,
            alignItems: 'center',
            backgroundColor: pkg.gold ? 'rgba(255, 215, 0, 0.1)' : COLORS.card
          }, 
          pkg.gold && { borderColor: COLORS.gold, borderWidth: 1.5, elevation: 5 }
        ]}
        onPress={() => navigation.navigate('Packages')}
      >
        {pkg.gold && (
          <View style={{ 
            position: 'absolute', 
            top: -10, 
            backgroundColor: COLORS.gold, 
            paddingHorizontal: 8, 
            borderRadius: 10 
          }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.background }}>TOP</Text>
          </View>
        )}
        <Ionicons 
          name={pkg.icon} 
          size={18} 
          color={pkg.gold ? COLORS.gold : COLORS.primary} 
          style={{ marginBottom: 8 }} 
        />
        <Text style={[styles.pkgTitle, { fontSize: 11 }, pkg.gold && { color: COLORS.gold }]}>
          {pkg.t}
        </Text>
        <Text style={[styles.pkgPrice, { fontSize: 12, marginVertical: 4 }]}>
          {cur}{formatCurrency(pkg.v)}
        </Text>
        <Text style={[styles.pkgApps, { fontSize: 9 }]}>
          {`${pkg.a_val} Apps`}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</Section>


<Section title={texts.careerTitle || "Plano de Carreira"} icon="trophy-outline" color={COLORS.gold}>
  <View style={styles.highlightCard}>
    <Text style={[styles.infoText, { marginBottom: 20, textAlign: 'center' }]}>
      Sua evolução é medida pelo volume da sua <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>Equipe Menor</Text> acumulado.
    </Text>

    {[
      { n: texts.rankRunner || 'RUNNER', p: '2.000', c: '#a4bccc' },
      { n: texts.rankBronze || 'BRONZE', p: '5.000', c: '#cd7f32' },
      { n: texts.rankSilver || 'SILVER', p: '15.000', c: '#C0C0C0' },
      { n: texts.rankGold || 'GOLD', p: '50.000', c: COLORS.gold },
      { n: texts.rankDiamond || 'DIAMOND', p: '160.000', c: '#00f2ff', elite: true },
    ].map((item, i, arr) => (
      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i === arr.length - 1 ? 0 : 15 }}>
        
        {/* Linha Conectora e Ícone */}
        <View style={{ alignItems: 'center', marginRight: 15 }}>
          <View style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 16, 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: item.c
          }}>
            <Ionicons name={item.elite ? "star" : "ribbon"} size={16} color={item.c} />
          </View>
          {/* Linha vertical que não aparece no último item */}
          {i !== arr.length - 1 && (
            <View style={{ width: 2, height: 15, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 5 }} />
          )}
        </View>

        {/* Card do Rank */}
        <View style={[styles.rankBox, { 
          flex: 1, 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 15,
          backgroundColor: item.elite ? 'rgba(0, 242, 255, 0.05)' : 'rgba(255,255,255,0.03)',
          borderLeftWidth: 3,
          borderLeftColor: item.c,
          marginBottom: 0 // Reseta o margin do style original
        }]}>
          <View>
            <Text style={[styles.rankName, { color: item.c, letterSpacing: 1 }]}>{item.n}</Text>
            {item.elite && <Text style={{ fontSize: 8, color: '#00f2ff', fontWeight: 'bold' }}>NÍVEL EXECUTIVO</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.rankPoints, { color: COLORS.white, fontWeight: 'bold' }]}>{item.p}</Text>
            <Text style={{ fontSize: 9, color: COLORS.textSub }}>PONTOS</Text>
          </View>
        </View>
      </View>
    ))}

    <View style={[styles.ruleBox, { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
      <Text style={[styles.complianceFootnote, { textAlign: 'center' }]}>
        🚀 Os pontos de carreira nunca zeram para fins de reconhecimento.
      </Text>
    </View>
  </View>
</Section>

<Section title={texts.generalRules || "Regras de Ouro & Fundamentos"} icon="shield-checkmark-outline" color={COLORS.success}>
  <View style={styles.highlightCard}>
    
    {/* GRID DE MÉTRICAS RÁPIDAS */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 }}>
      
      {/* CARD: CONVERSÃO DE PONTOS */}
      <View style={[styles.ruleBox, { width: '48%', marginBottom: 10, alignItems: 'center', backgroundColor: 'rgba(44, 148, 188, 0.05)' }]}>
        <Ionicons name="stats-chart" size={20} color={COLORS.primary} />
        <Text style={[styles.infoText, { fontSize: 10, marginTop: 5 }]}>{texts.rulePoint || "VALOR DO PONTO"}</Text>
        <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>
          1 pt = {cur} {formatCurrency(1.00)}
        </Text>
      </View>

      {/* CARD: PESO DO APP */}
      <View style={[styles.ruleBox, { width: '48%', marginBottom: 10, alignItems: 'center', backgroundColor: 'rgba(46, 204, 113, 0.05)' }]}>
        <Ionicons name="apps" size={20} color={COLORS.success} />
        <Text style={[styles.infoText, { fontSize: 10, marginTop: 5 }]}>PRODUTIVIDADE</Text>
        <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>
          10 pts / App
        </Text>
      </View>

      {/* CARD: CICLO DE PAGAMENTO */}
      <View style={[styles.ruleBox, { width: '100%', marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255, 215, 0, 0.05)' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.infoText, { fontSize: 10 }]}>FECHAMENTO</Text>
          <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>DIÁRIO</Text>
        </View>
        <View style={{ width: 1, height: '100%', backgroundColor: COLORS.border }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.infoText, { fontSize: 10 }]}>PAGAMENTO</Text>
          <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>SEMANAL</Text>
        </View>
      </View>
    </View>

    {/* RESUMO DE ATIVAÇÃO COM DESTAQUE */}
    <View style={[styles.activeCard, { backgroundColor: 'rgba(0,0,0,0.3)', borderLeftWidth: 4, borderLeftColor: COLORS.primary }]}>
      <Text style={[styles.typeTitle, { fontSize: 12, marginBottom: 5 }]}>⚡ REQUISITO DE ATIVAÇÃO MENSAL</Text>
      <Text style={[styles.infoText, { color: COLORS.textMain, lineHeight: 18 }]}>
        Para manter o status <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>QUALIFICADO</Text>, você precisa gerar no mínimo <Text style={{ fontWeight: 'bold' }}>50 pontos</Text> pessoais.
      </Text>
      
      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: COLORS.white }}>EXEMPLO</Text>
        </View>
        <Text style={[styles.infoText, { fontSize: 11 }]}>5 Apps Próprios ou 5 Clientes Diretos</Text>
      </View>
    </View>

    {/* NOTA DE COMPLIANCE NO RODAPÉ */}
    <View style={{ marginTop: 20, padding: 10, borderRadius: 8, borderStyle: 'dotted', borderWidth: 1, borderColor: COLORS.border }}>
      <Text style={[styles.complianceFootnote, { textAlign: 'center', lineHeight: 16 }]}>
        🛡️ <Text style={{ fontWeight: 'bold' }}>Nota de Transparência:</Text> O Diamond Runner é um modelo baseado em volume de produtos reais. Não há ganhos garantidos sem esforço comercial e liderança.
      </Text>
    </View>

  </View>
</Section>
</ScrollView>


  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  headerArea: { alignItems: 'center', marginVertical: 30 },
  mainTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textMain, letterSpacing: 2 },
  subtitle: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  sectionContainer: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  sectionTitle: { color: COLORS.textMain, fontSize: 13, fontWeight: '700' },
  sectionContent: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: 'rgba(0,0,0,0.2)' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  activeCard: { backgroundColor: 'rgba(255, 215, 0, 0.05)', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: COLORS.gold },
  activeTitle: { color: COLORS.gold, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  highlightCard: { backgroundColor: 'rgba(44, 148, 188, 0.1)', padding: 16, borderRadius: 8 },
  highlightValue: { fontSize: 22, fontWeight: '900', color: COLORS.textMain },

  comboTable: { marginVertical: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  comboRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  comboText: { color: COLORS.textMain, fontSize: 12 },
  successIcon: { color: COLORS.success, fontWeight: 'bold' },

  financeBox: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(44, 148, 188, 0.1)', padding: 10, borderRadius: 8, marginTop: 10 },
  financeLabel: { color: COLORS.textSub, fontSize: 10, marginBottom: 2 },
  financeText: { color: COLORS.success, fontWeight: 'bold', fontSize: 12 },
  lockNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 5, marginBottom: 10 },
  lockNoticeText: { color: COLORS.textSub, fontSize: 11, marginLeft: 8 },
  warningText: { color: COLORS.gold, fontSize: 11, fontStyle: 'italic', marginBottom: 10 },
  complianceFootnote: { color: COLORS.textSub, fontSize: 10, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },

  tableHeader: { flexDirection: 'row', marginBottom: 8 },
  tableLabel: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },

  pkgRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pkgCard: { width: (width - 60) / 3, backgroundColor: COLORS.background, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center' },
  pkgTitle: { color: COLORS.textSub, fontSize: 10, fontWeight: 'bold' },
  pkgPrice: { color: COLORS.textMain, fontSize: 14, fontWeight: 'bold', marginVertical: 4 },
  pkgApps: { color: COLORS.primary, fontSize: 10 },

  planText: { color: COLORS.textSub, fontSize: 14, marginTop: 4 },
  infoText: { color: COLORS.textSub, fontSize: 12, fontStyle: 'italic', marginTop: 12 },
  typeBox: { marginBottom: 12, padding: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8 },
  typeTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  rankBox: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rankName: { color: COLORS.textMain, fontWeight: 'bold' },
  rankPoints: { color: COLORS.gold, fontWeight: 'bold' },
  ruleBox: { marginVertical: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: COLORS.primary },
  touchHint: { color: COLORS.textSub, fontSize: 12, marginBottom: 10, fontStyle: 'italic' },
});