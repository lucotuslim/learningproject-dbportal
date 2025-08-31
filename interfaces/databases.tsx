export interface IDatabaseInfo {
  database_id: number;
  name: string;
  create_date: Date;
  compatibility_level?: number;
  collation_name?: string;
  user_access_desc?: string;
  state_desc?: string;
  recovery_model_desc?: string;
  containment_desc?: string;
}