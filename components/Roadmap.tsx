import React from 'react';
import { Map, Code, Database, Shield, Zap, FileCode, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';

const RoadmapItem: React.FC<{ 
  title: string; 
  description: string; 
  functions: { name: string; desc: string }[];
  icon: any 
}> = ({ title, description, functions, icon: Icon }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-900/50 transition-colors animate-fade-in group">
    <div className="flex items-start gap-4 mb-4">
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg group-hover:border-cyan-500/30 transition-colors">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
    </div>
    
    <div className="space-y-3 pl-4 border-l border-slate-800 ml-6">
      {functions.map((fn, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-[21px] top-2 w-2 h-2 rounded-full bg-slate-700 ring-4 ring-slate-900 group-hover:bg-cyan-500 transition-colors" />
          <h4 className="font-mono text-sm text-yellow-100/90 font-medium bg-slate-950/50 inline-block px-2 py-0.5 rounded border border-slate-800/50 mb-1">
            {fn.name}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">{fn.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export const Roadmap: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
           <Map className="w-6 h-6 text-purple-400" />
           <h2 className="text-xl font-bold text-white">System Development Map</h2>
        </div>
        <p className="text-slate-400 text-sm">
          A technical guide detailing the individual functions required to transition from simulation to a fully operational production environment.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <RoadmapItem 
          icon={FileCode}
          title="1. Gestão e Integridade de Ativos"
          description="Funções para listar e verificar a integridade de plugins e temas no diretório structure."
          functions={[
            { name: "fetchInstalledAssets(targetUrl, creds)", desc: "Listar todos os plugins/temas via leitura de diretório ou WP API. Extrair cabeçalhos e status (ativo/inativo)." },
            { name: "verifySingleAssetIntegrity(asset, creds)", desc: "Comparar hash MD5 dos arquivos locais com o repositório oficial do WordPress.org." },
            { name: "verifyAllAssets(assetsList, creds)", desc: "Implementar fila assíncrona para processar verificação em lote sem timeout." }
          ]}
        />

        <RoadmapItem 
          icon={Zap}
          title="2. Protocolos de Conexão"
          description="Substituição dos timers de simulação por handshakes de rede reais."
          functions={[
            { name: "initiateHandshake(url, appPassword)", desc: "Validar endpoint WP-JSON e autenticação básica de usuário." },
            { name: "validateDatabaseAccess(host, user, pass)", desc: "Testar conexão PDO/MySQLi direta e permissões de escrita." },
            { name: "establishSecureTunnel(sshConfig)", desc: "Estabelecer túnel SSH para operações seguras de sistema de arquivos." }
          ]}
        />

        <RoadmapItem 
          icon={Shield}
          title="3. Motores de Diagnóstico"
          description="Lógica de execução para os botões da toolbar de scan."
          functions={[
            { name: "scanSEOandAds(targetUrl)", desc: "Verificar meta tags, robots.txt, ads.txt e métricas de Landing Page Experience." },
            { name: "scanMalwareSignatures(path)", desc: "Scan recursivo por padrões Regex (eval, base64_decode) em arquivos .php e .js." },
            { name: "scanDatabaseHealth(dbConnection)", desc: "Analisar tamanho do autoload, metadados órfãos e injeções SQL em wp_posts." }
          ]}
        />

        <RoadmapItem 
          icon={Terminal}
          title="4. Remediação Autônoma"
          description="Funções críticas que executam alterações no ambiente de produção."
          functions={[
            { name: "executeRemediationPlan(issues, creds)", desc: "Roteador de correções: Executa SQL para DB, Patching para FS, ou Config Updates." },
            { name: "createPreventiveBackup()", desc: "Função pré-requisito que gera dump do banco antes de aplicar correções." }
          ]}
        />

        <RoadmapItem 
          icon={Code}
          title="5. Módulo Complementar (Web Tracking)"
          description="Integração do satélite de rastreamento no alvo."
          functions={[
            { name: "injectTrackingModule(targetUrl)", desc: "Instalar/Verificar o mu-plugin 'Aegis Tracker' no alvo." },
            { name: "hookRealTimeValidation()", desc: "Injetar script JS no wp_head que conecta à API validateContent deste painel." }
          ]}
        />

      </div>
      
      <div className="mt-8 p-4 border-t border-slate-800 text-center">
        <button className="text-xs font-mono text-cyan-500 hover:text-cyan-400 flex items-center justify-center gap-2 mx-auto">
          <Terminal className="w-3 h-3" />
          Download Full Technical Spec (JSON)
        </button>
      </div>
    </div>
  );
};