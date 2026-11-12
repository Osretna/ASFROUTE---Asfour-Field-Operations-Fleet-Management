import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Database, Cpu, Network, Map, FileCode, Check, Copy } from 'lucide-react';

export const ArchitectureViewer: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'schema' | 'ortools' | 'realtime' | 'maps'>('schema');
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SCHEMA_SQL = `-- ASFROUTE Enterprise PostgreSQL + PostGIS Core DDL
-- Asfour Crystal Field Service Management & Fleet Operations System

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Branches & Regional Hubs
CREATE TABLE branches (
    id VARCHAR(50) PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    is_central_depot BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fleet Master & Physical Load Constraints
CREATE TABLE vehicles (
    id VARCHAR(50) PRIMARY KEY,
    plate_number VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    branch_id VARCHAR(50) REFERENCES branches(id),
    status VARCHAR(30) NOT NULL,
    max_payload_kg NUMERIC(8,2) NOT NULL,
    volumetric_capacity_m3 NUMERIC(6,2) NOT NULL,
    internal_height_meters NUMERIC(4,2) NOT NULL,
    has_hydraulic_crane BOOLEAN DEFAULT false,
    has_pneumatic_damping BOOLEAN DEFAULT true, -- Crucial for crystal fragility
    current_location GEOMETRY(Point, 4326),
    speed_kmh NUMERIC(5,2) DEFAULT 0,
    fuel_level_percent INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Technicians & Graded Skill Matrix
CREATE TABLE technicians (
    id VARCHAR(50) PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    branch_id VARCHAR(50) REFERENCES branches(id),
    status VARCHAR(30) NOT NULL,
    customer_rating NUMERIC(3,2) DEFAULT 5.0,
    max_certified_height_meters NUMERIC(4,2) NOT NULL,
    is_high_altitude_cleared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE technician_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id VARCHAR(50) REFERENCES technicians(id) ON DELETE CASCADE,
    skill_category VARCHAR(100) NOT NULL,
    skill_level INTEGER CHECK (skill_level BETWEEN 1 AND 5),
    issued_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    verification_hash VARCHAR(255)
);

-- 4. Work Orders & Chandelier Engineering Specs
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name_ar VARCHAR(255) NOT NULL,
    customer_name_en VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL,
    site_location GEOMETRY(Point, 4326) NOT NULL,
    governorate VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    
    -- Chandelier Specs & Physical Constraints
    chandelier_model VARCHAR(100) NOT NULL,
    crystal_lead_purity VARCHAR(50) DEFAULT '30% PbO Full Lead',
    chandelier_weight_kg NUMERIC(8,2) NOT NULL,
    chandelier_height_cm NUMERIC(6,2) NOT NULL,
    total_crystal_prisms INTEGER NOT NULL,
    required_anchor_load_kg NUMERIC(8,2) NOT NULL,
    scaffolding_height_meters NUMERIC(4,2) NOT NULL,
    fragility_tier VARCHAR(50) NOT NULL,
    
    assigned_vehicle_id VARCHAR(50) REFERENCES vehicles(id),
    assigned_lead_technician_id VARCHAR(50) REFERENCES technicians(id),
    anchor_test_verified BOOLEAN DEFAULT false,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial Indices for Proximity and Routing
CREATE INDEX idx_vehicles_geom ON vehicles USING GIST(current_location);
CREATE INDEX idx_work_orders_site ON work_orders USING GIST(site_location);`;

  const ORTOOLS_PYTHON = `# ASFROUTE Smart Scheduling Engine
# Python Microservice with Google OR-Tools (Vehicle Routing Problem with Time Windows & Skills)

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

class AsfourCrystalDispatcher:
    def __init__(self, distance_matrix, time_windows, vehicle_capacities, job_weights, skill_requirements):
        self.distance_matrix = distance_matrix
        self.time_windows = time_windows
        self.vehicle_capacities = vehicle_capacities # Max kg load
        self.job_weights = job_weights               # Chandelier weight in kg
        self.skill_requirements = skill_requirements # Level 1-5 certified

    def solve_fleet_schedule(self):
        manager = pywrapcp.RoutingIndexManager(
            len(self.distance_matrix),
            len(self.vehicle_capacities),
            0 # Central Factory Depot
        )
        routing = pywrapcp.RoutingModel(manager)

        # 1. Travel Time & Google Maps Real Road Distance Evaluation
        def distance_callback(from_idx, to_idx):
            from_node = manager.IndexToNode(from_idx)
            to_node = manager.IndexToNode(to_idx)
            return self.distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # 2. Strict Physical Vehicle Weight Capacity Constraint
        def demand_callback(from_idx):
            from_node = manager.IndexToNode(from_idx)
            return self.job_weights[from_node]

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0, # null capacity slack
            self.vehicle_capacities, # per truck max kg
            True, # start cumul to zero
            'Capacity_Weight_KG'
        )

        # 3. Time Windows Constraints (Customer Appointments)
        routing.AddDimension(
            transit_callback_index,
            30,  # 30 min arrival slack
            720, # 12 hours working horizon (minutes)
            False,
            'Time_Windows'
        )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 5

        solution = routing.SolveWithParameters(search_parameters)
        return solution`;

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'هندسة النظام ومخطط قواعد البيانات' : 'Enterprise System Architecture & Schema DDL'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'مخطط PostgreSQL + PostGIS الجغرافي، ومحرك الجدولة الرياضي Google OR-Tools، وتدفق WebSocket اللحظي' 
              : 'PostgreSQL + PostGIS spatial schema, Google OR-Tools constraint solver & WebSocket topology'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'schema' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            PostgreSQL + PostGIS
          </button>
          <button
            onClick={() => setActiveTab('ortools')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'ortools' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Google OR-Tools Solver
          </button>
        </div>
      </div>

      {/* Code / Architecture Window */}
      <div className="flex-1 bg-[#0A0E17] rounded-xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="font-mono text-slate-400 ml-2">
              {activeTab === 'schema' ? 'asfour_fsm_schema.sql' : 'asfour_optimizer.py'}
            </span>
          </div>

          <button
            onClick={() => copyCode(activeTab === 'schema' ? SCHEMA_SQL : ORTOOLS_PYTHON)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#060910]">
          <pre className="whitespace-pre">
            {activeTab === 'schema' ? SCHEMA_SQL : ORTOOLS_PYTHON}
          </pre>
        </div>
      </div>
    </div>
  );
};
